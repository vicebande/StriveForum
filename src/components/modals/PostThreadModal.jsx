import React from 'react';

const PostThreadModal = ({ show, onClose, post = null, onReply }) => {
  if (!show || !post) return null;

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal post-thread-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="rf-modal-header">
          <h5 style={{margin:0}}>Publicación de {post.author}</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <div className="rf-modal-body">
          <div className="card-custom p-3 mb-3">
            <div><strong>{post.author}</strong> <span className="small text-muted">• {new Date(post.createdAt).toLocaleString()}</span></div>
            <div style={{marginTop:8, whiteSpace:'pre-wrap'}}>{post.message}</div>
          </div>

          <div>
            <h6>Respuestas</h6>
            {(!post.replies || post.replies.length === 0) && <div className="small text-muted">No hay respuestas todavía.</div>}
            {(post.replies || []).map(r => (
              <div key={r.id} className="card-custom p-2 mb-2">
                <div className="small"><strong>{r.author}</strong> <span className="small text-muted">• {new Date(r.createdAt).toLocaleString()}</span></div>
                <div style={{marginTop:6, whiteSpace:'pre-wrap'}}>{r.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rf-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => { onReply(post.id); }}>Responder</button>
        </div>
      </div>
    </div>
  );
};

export default PostThreadModal;