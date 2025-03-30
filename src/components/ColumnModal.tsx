import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface ColumnModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (title: string) => void;
  initialTitle?: string;
}

export function ColumnModal({ show, onHide, onSubmit, initialTitle }: ColumnModalProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (show && initialTitle) {
      setTitle(initialTitle);
    } else if (!show) {
      setTitle('');
    }
  }, [show, initialTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialTitle ? 'Edit Column' : 'Add New Column'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Column Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter column title"
              autoFocus
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialTitle ? 'Save Changes' : 'Add Column'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}