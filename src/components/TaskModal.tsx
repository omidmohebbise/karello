import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup } from 'react-bootstrap';
import { Editor } from '@tinymce/tinymce-react';
import { Plus, Pencil, Trash2, CheckSquare, Circle, User, Search } from 'lucide-react';
import { TaskColor, Attachment, SubTask } from '../types';
import { useBoardStore } from '../store/boardStore';

interface TaskModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    assignee: string;
    dueDate?: Date;
    color: TaskColor;
    attachments: Attachment[];
    subTasks: SubTask[];
  }) => void;
  initialData?: {
    title: string;
    description: string;
    assignee: string;
    dueDate?: Date;
    color: TaskColor;
    attachments: Attachment[];
    subTasks: SubTask[];
  };
}

const COLORS: { value: TaskColor; label: string; bg: string; ring: string }[] = [
  { value: 'gray', label: 'Default', bg: 'bg-gray-100', ring: 'ring-gray-400' },
  { value: 'red', label: 'High Priority', bg: 'bg-red-100', ring: 'ring-red-400' },
  { value: 'yellow', label: 'Medium Priority', bg: 'bg-yellow-100', ring: 'ring-yellow-400' },
  { value: 'green', label: 'Low Priority', bg: 'bg-green-100', ring: 'ring-green-400' },
  { value: 'blue', label: 'In Progress', bg: 'bg-blue-100', ring: 'ring-blue-400' },
  { value: 'purple', label: 'Review', bg: 'bg-purple-100', ring: 'ring-purple-400' },
  { value: 'pink', label: 'Blocked', bg: 'bg-pink-100', ring: 'ring-pink-400' },
];

export function TaskModal({ show, onHide, onSubmit, initialData }: TaskModalProps) {
  const { activeBoard } = useBoardStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState<TaskColor>('gray');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [editingSubTask, setEditingSubTask] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setAssignee(initialData.assignee);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
      setColor(initialData.color);
      setAttachments(initialData.attachments);
      setSubTasks(initialData.subTasks);
    } else if (!show) {
      setTitle('');
      setDescription('');
      setAssignee('');
      setAssigneeSearch('');
      setDueDate('');
      setColor('gray');
      setAttachments([]);
      setSubTasks([]);
      setNewSubTask('');
      setEditingSubTask(null);
    }
  }, [show, initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      color,
      attachments,
      subTasks,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: file.name,
            url: URL.createObjectURL(file),
            file,
            data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: newSubTask.trim(),
          completed: false,
        },
      ]);
      setNewSubTask('');
    }
  };

  const toggleSubTask = (id: string) => {
    setSubTasks((prev) =>
      prev.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const startEditingSubTask = (subTask: SubTask) => {
    setEditingSubTask({ id: subTask.id, title: subTask.title });
  };

  const saveEditingSubTask = () => {
    if (editingSubTask) {
      setSubTasks((prev) =>
        prev.map((st) =>
          st.id === editingSubTask.id
            ? { ...st, title: editingSubTask.title }
            : st
        )
      );
      setEditingSubTask(null);
    }
  };

  const deleteSubTask = (id: string) => {
    setSubTasks((prev) => prev.filter((st) => st.id !== id));
  };

  const filteredUsers = activeBoard?.sharedWith.filter(user => 
    user.email.toLowerCase().includes(assigneeSearch.toLowerCase())
  ) || [];

  const handleSelectUser = (email: string) => {
    setAssignee(email);
    setAssigneeSearch('');
    setShowAssigneeDropdown(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Task' : 'Add New Task'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color Label</Form.Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    p-2 rounded-lg text-sm font-medium text-gray-700
                    ${c.bg} hover:ring-2 transition-shadow
                    ${color === c.value ? `ring-2 ${c.ring}` : ''}
                  `}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Editor
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
              value={description}
              onEditorChange={(content) => setDescription(content)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" ref={assigneeRef}>
            <Form.Label>Assignee</Form.Label>
            <div className="relative">
              <InputGroup>
                <InputGroup.Text>
                  <User size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={assigneeSearch}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    setShowAssigneeDropdown(true);
                  }}
                  onFocus={() => setShowAssigneeDropdown(true)}
                  placeholder={assignee || "Search users..."}
                />
                {assignee && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      setAssignee('');
                      setAssigneeSearch('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>

              {showAssigneeDropdown && (filteredUsers.length > 0 || !assigneeSearch) && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  <div className="py-1">
                    {!assigneeSearch && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Type to search users...
                      </div>
                    )}
                    {filteredUsers.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => handleSelectUser(user.email)}
                      >
                        <User size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subtasks</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Enter subtask"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubTask();
                  }
                }}
              />
              <Button variant="outline-secondary" onClick={addSubTask}>
                <Plus size={16} />
              </Button>
            </InputGroup>
            <ListGroup>
              {subTasks.map((subTask) => (
                <ListGroup.Item
                  key={subTask.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {editingSubTask?.id === subTask.id ? (
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={editingSubTask.title}
                        onChange={(e) =>
                          setEditingSubTask({
                            ...editingSubTask,
                            title: e.target.value,
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEditingSubTask();
                          }
                        }}
                      />
                      <Button variant="outline-success" onClick={saveEditingSubTask}>
                        Save
                      </Button>
                    </InputGroup>
                  ) : (
                    <>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => toggleSubTask(subTask.id)}
                        >
                          {subTask.completed ? (
                            <CheckSquare size={16} className="text-success" />
                          ) : (
                            <Circle size={16} />
                          )}
                        </Button>
                        <span className={subTask.completed ? 'text-decoration-line-through text-muted' : ''}>
                          {subTask.title}
                        </span>
                      </div>
                      <div>
                        <Button
                          variant="link"
                          className="text-primary p-0 me-2"
                          onClick={() => startEditingSubTask(subTask)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => deleteSubTask(subTask.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Attachments</Form.Label>
            <Form.Control
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="mb-2"
            />
            {attachments.length > 0 && (
              <div className="border rounded p-2">
                {attachments.map((att) => (
                  <div key={att.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                    <span className="text-truncate">{att.name}</span>
                    <Button
                      variant="link"
                      className="text-danger p-0 ms-2"
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Save Changes' : 'Add Task'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}