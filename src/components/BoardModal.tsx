import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface BoardModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (title: string) => void;
}

export function BoardModal({ show, onHide, onSubmit }: BoardModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Board</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Board Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title"
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
            Create Board
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}