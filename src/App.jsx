import '@ant-design/v5-patch-for-react-19';
import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Modal, Form, Input, InputNumber, Popconfirm, message, Typography, Layout, ConfigProvider, theme} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SunFilled, MoonFilled, EyeOutlined } from '@ant-design/icons';
import Placeholder from './Placeholder.png'
import axios from 'axios';
const {Title, Paragraph} = Typography
const {Header} = Layout
const MOCK_API_URL = 'https://6ab3a56b217e4365883134b5.mockapi.io/books';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [statusTexts, setStatusTexts] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') || false)
  const [selectedBook, setSelectedBook] = useState(null);

  const [form] = Form.useForm();

  const fetchBooks = async () => {
    setLoading(true);
    setStatusCode(null);
    setStatusTexts(null);
    try {
      const response = await axios.get(MOCK_API_URL);
      setBooks(response.data);
    } catch (error) {
      if (error.response) {
      console.error(`HTTP ${error.response.status}: ${error.response.data}`);
        setStatusCode(error.response.status)
        setStatusTexts(error.response.statusText || error.response.data)
    } else {
      console.error('Network/Request Error:', error.message);
    }
      message.error('Failed to load books from MockAPI');
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openModal = (book = null) => {
    setEditingBook(book);
    if (book) {
      form.setFieldsValue(book); // Pre-fill form if editing
    } else {
      form.resetFields(); // Clear form if adding new
    }
    setIsModalOpen(true);
  };
  const openModal2 = (book) => {
  setSelectedBook(book);
};

const closeModal2 = () => {
  setSelectedBook(null);
};

  // 2 & 3. SUBMIT FORM (CREATE & UPDATE)
  const handleFormSubmit = async (values) => {
    try {
      if (editingBook) {
        await axios.put(`${MOCK_API_URL}/${editingBook.id}`, values);
        message.success('Book updated successfully!');
      } else {
        await axios.post(MOCK_API_URL, values);
        message.success('Book added successfully!');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchBooks(); 
    } catch (error) {
      message.error('Failed to save book data');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${MOCK_API_URL}/${id}`);
      message.success('Book deleted successfully!');
      fetchBooks(); // Automatically refreshes the UI list
    } catch (error) {
      message.error('Failed to delete book');
    }
  };
  const changeTheme = () => {
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('theme', isDarkMode)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "'Kalam', cursive",
        },
      }}
    >
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0' }}>
        <Header style={{margin: 0, padding: '10px', width: '100%', height: 'auto', backgroundColor: isDarkMode ? '#001122' : '#ddeeff'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
          <Title style={{ margin: 0 }}>Book Collection Manager</Title>
          <Paragraph>Every Book you've read, borrowed, or want to brag about - <br />
          Kept on one shelf. <strong>{books.length} {books.length === 1 ? 'book' : 'books'} on the shelf</strong></Paragraph>
          </div>
          <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
          <Button type="primary" icon={isDarkMode ? <MoonFilled/> : <SunFilled/>} onClick={() => changeTheme()}>
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Add Book
          </Button>
          </div>
        </div>
      </Header>
      <div style={{padding: '24px'}}>
      {loading ? (
  <Paragraph>Loading collection...</Paragraph>
) : statusCode ? (
  <div style={{ margin: '50px', textAlign: 'center'}}>
    <Title style={{fontSize: '100px'}}>{statusCode}</Title>
    <Paragraph style={{fontWeight: 'bolder'}}>{statusTexts}</Paragraph>
  </div>
) : books.length === 0 ? (
  <Paragraph>No books found in the collection.</Paragraph>
) : (
  <>
        <Row gutter={[16, 16]}>
          {books.map((book) => (
            <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={book.title}
                    src={book.image.startsWith("https://") || book.image.startsWith("http://") ? book.image : Placeholder}
                    style={{ height: '260px', objectFit: 'cover' }}
                  />
                }
                actions={[
                  <EyeOutlined key="view" onClick={() => openModal2(book)} />,
                  <EditOutlined key="edit" onClick={() => openModal(book)} />,
                  <Popconfirm
                    title="Delete this book?"
                    description="Are you sure you want to delete this book from your collection?"
                    onConfirm={() => handleDelete(book.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={book.title}
                  description={
                    <div>
                      <Paragraph style={{ margin: '4px 0' }}><strong>Author:</strong> {book.author}</Paragraph>
                      <Paragraph style={{ margin: '4px 0' }}><strong>Genre:</strong> {book.genre}</Paragraph>
                      <Paragraph style={{ margin: '4px 0' }}><strong>Year:</strong> {book.year}</Paragraph>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {book.description}
                      </Paragraph>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </>
    )}
    <Modal 
  title={selectedBook?.title || "Book Details"} 
  open={!!selectedBook}
  onCancel={closeModal2}
  footer={<>
  <Button type='primary' onClick={closeModal2}>Close</Button>
  </>}
>
  {selectedBook && (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <img 
          src={selectedBook.image.startsWith("https://") || selectedBook.image.startsWith("http://") ? selectedBook.image : Placeholder} 
          alt={selectedBook.title} 
          style={{ maxHeight: '300px', objectFit: 'contain' }}
        />
      </div>
      <p><strong>Author:</strong> {selectedBook.author}</p>
      <p><strong>Genre:</strong> {selectedBook.genre}</p>
      <p><strong>Year:</strong> {selectedBook.year}</p>
      <p><strong>Description:</strong> {selectedBook.description}</p>
    </div>
  )}
</Modal>
      <Modal
        title={editingBook ? "Edit Book Details" : "Add New Book"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ year: new Date().getFullYear() }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter Title' }]}>
            <Input placeholder="Enter book title" />
          </Form.Item>

          <Form.Item name="author" label="Author" rules={[{ required: true, message: "Please enter the author's Name" }]}>
            <Input placeholder="Enter author name" />
          </Form.Item>

          <Form.Item name="genre" label="Genre" rules={[{ required: true, message: "Please enter the Book's Genre" }]}>
            <Input placeholder="Enter genre (e.g., Fiction, Sci-Fi)" />
          </Form.Item>

          <Form.Item name="year" label="Publication Year" rules={[{ required: true, type: 'number', message: 'Please enter the Year where this book got published' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="e.g. 2024" min={0} max={2100} />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter the Description" }, {max: 1000, message: "Description can't contain more than a thousand words"}]}>
            <Input.TextArea rows={3} placeholder="Enter book summary or notes" />
          </Form.Item>

          <Form.Item name="image" label="Image URL" rules={[{ required: true, message: "Please enter an Image URL" }, {type: 'url', message: "This is Not an Image URL"}]}>
            <Input placeholder="Paste image cover link address" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
    </Layout>
    </ConfigProvider>
  );
}
//24px
