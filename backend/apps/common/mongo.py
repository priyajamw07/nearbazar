import os
import json
import logging
from datetime import datetime, timezone
from bson import ObjectId
from django.conf import settings
import pymongo
import mongomock

logger = logging.getLogger(__name__)

_mongo_client = None
_db_instance = None
_mock_db_instance = None
_live_mongo_available = None

SNAPSHOT_PATH = os.path.join(settings.BASE_DIR, 'mongo_data_snapshot.json')

class JSONEncoderWithBSON(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return {'$oid': str(obj)}
        if isinstance(obj, datetime):
            return {'$date': obj.isoformat()}
        return super().default(obj)

def json_decoder_hook(dct):
    if '$oid' in dct:
        return ObjectId(dct['$oid'])
    if '$date' in dct:
        return datetime.fromisoformat(dct['$date'])
    return dct

def save_mock_snapshot():
    global _mock_db_instance
    if _mock_db_instance is None:
        return
    try:
        data = {}
        for coll_name in _mock_db_instance.list_collection_names():
            docs = list(_mock_db_instance[coll_name].find())
            data[coll_name] = docs
        with open(SNAPSHOT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, cls=JSONEncoderWithBSON, indent=2)
    except Exception as e:
        logger.error(f"Error saving mock snapshot: {e}")

def load_mock_snapshot():
    global _mock_db_instance
    if _mock_db_instance is None or not os.path.exists(SNAPSHOT_PATH):
        return
    try:
        with open(SNAPSHOT_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f, object_hook=json_decoder_hook)
        for coll_name, docs in data.items():
            if docs:
                _mock_db_instance[coll_name].drop()
                _mock_db_instance[coll_name].insert_many(docs)
    except Exception as e:
        logger.error(f"Error loading mock snapshot: {e}")

class PersistentCollectionWrapper:
    """Wraps a collection so that write operations persist to snapshot disk."""
    def __init__(self, coll):
        self._coll = coll

    def __getattr__(self, name):
        attr = getattr(self._coll, name)
        if name in ('insert_one', 'insert_many', 'update_one', 'update_many', 'delete_one', 'delete_many', 'drop'):
            def wrapped(*args, **kwargs):
                res = attr(*args, **kwargs)
                save_mock_snapshot()
                return res
            return wrapped
        return attr

class PersistentDatabaseWrapper:
    """Wraps database to return persistent collection wrappers."""
    def __init__(self, db):
        self._db = db

    def __getattr__(self, name):
        coll = getattr(self._db, name)
        return PersistentCollectionWrapper(coll)

    def __getitem__(self, name):
        return PersistentCollectionWrapper(self._db[name])

    def list_collection_names(self):
        return self._db.list_collection_names()


def get_db():
    global _mongo_client, _db_instance, _mock_db_instance, _live_mongo_available

    db_name = getattr(settings, 'MONGODB_DB_NAME', 'nearbybazaar')

    if _live_mongo_available is True and _db_instance is not None:
        return _db_instance

    if _live_mongo_available is False and _mock_db_instance is not None:
        return PersistentDatabaseWrapper(_mock_db_instance)

    uri = getattr(settings, 'MONGODB_URI', 'mongodb://localhost:27017/nearbybazaar')

    if _live_mongo_available is None:
        try:
            client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=500)
            client.admin.command('ping')
            _mongo_client = client
            _db_instance = client[db_name]
            _live_mongo_available = True
            logger.info(f"Connected successfully to primary MongoDB at {uri}")
            return _db_instance
        except Exception:
            _live_mongo_available = False

    if _mock_db_instance is None:
        mock_client = mongomock.MongoClient()
        raw_mock_db = mock_client[db_name]
        _mock_db_instance = raw_mock_db
        load_mock_snapshot()

    return PersistentDatabaseWrapper(_mock_db_instance)

def to_object_id(val):
    if not val:
        return None
    if isinstance(val, ObjectId):
        return val
    try:
        return ObjectId(str(val))
    except Exception:
        return None

def serialize_doc(doc):
    """Recursively converts BSON ObjectId, datetime, and Mongo specifics into clean JSON-serializable structures."""
    if doc is None:
        return None
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == '_id':
                result['id'] = str(v)
            else:
                result[k] = serialize_doc(v)
        return result
    return doc

def serialize_cursor(cursor):
    return [serialize_doc(d) for d in cursor]

def now_utc():
    return datetime.now(timezone.utc)
