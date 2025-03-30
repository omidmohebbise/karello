import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { User, UserPlus, Trash2, Mail } from 'lucide-react';
import { SharedUser } from '../types';

interface ShareModalProps {
  show: boolean;
  onHide: () => void;
  sharedUsers: SharedUser[];
  onShare: (email: string, role: 'viewer' | 'editor') => void;
  onRemove: (email: string) => void;
}

export function ShareModal({ show, onHide, sharedUsers, onShare, onRemove }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onShare(email.trim(), role);
      setEmail('');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center gap-2">
          <UserPlus size={20} />
          Share Board
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-4">
            <Form.Group className="flex-1">
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </Form.Group>
            <Form.Group className="w-32">
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Share
            </Button>
          </div>
        </Form>

        <div className="mt-4">
          <h6 className="font-medium text-gray-700 mb-2">Shared with</h6>
          {sharedUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No users shared with yet</p>
          ) : (
            <ListGroup>
              {sharedUsers.map((user) => (
                <ListGroup.Item
                  key={user.email}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-gray-500">
                        {user.role} • Shared on {formatDate(user.sharedAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => onRemove(user.email)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}