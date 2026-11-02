from apps.common.mongo import get_db, now_utc, to_object_id

def log_audit_event(actor_id=None, actor_email=None, actor_role='SYSTEM',
                    action='UNKNOWN', target_type=None, target_id=None,
                    ip_address=None, metadata=None):
    """Writes an append-only audit record into audit_logs collection."""
    try:
        db = get_db()
        record = {
            'actor_id': to_object_id(actor_id) if actor_id else None,
            'actor_email': actor_email or 'system@nearbybazaar.com',
            'actor_role': actor_role,
            'action': action,
            'target_type': target_type,
            'target_id': str(target_id) if target_id else None,
            'ip_address': ip_address or '127.0.0.1',
            'metadata': metadata or {},
            'created_at': now_utc()
        }
        db.audit_logs.insert_one(record)
    except Exception as e:
        # Never crash the main request if audit logging encounters an issue
        pass
