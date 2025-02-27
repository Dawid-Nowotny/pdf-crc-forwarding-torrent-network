import { useState, useEffect } from 'react';
import { sendPDF } from '../../services/api';
import './FileTransferForm.css';
import logService from '../../services/LogService';

function FileTransferForm() {
  const [file, setFile] = useState(null);
  const [first_seeder, setFirstSeeder] = useState('Node1');
  const [target_node, setTargetNode] = useState('Node5');
  const [message, setMessage] = useState('');
  const [type, setType] = useState(''); 
  const [showMessage, setShowMessage] = useState(false);

  const handleAddMessage = (message, type) => {
    setMessage(message);
    setType(type);
    setShowMessage(true);
  };

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [showMessage]);


  const handleSubmit = async (e) => {
    logService.clearLogs();
    logService.setShouldColorGraph(false);
    e.preventDefault();

    if (!file || !first_seeder || !target_node) {
      handleAddMessage('Please fill in all fields!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('first_seeder', first_seeder);
    formData.append('target_node', target_node);

    try {
      await sendPDF(formData);
      setTimeout(() => {
        logService.setShouldColorGraph(true);
      }, 100);
      handleAddMessage('File sent successfully!', 'success');
    } catch (error) {
      console.error(error);
      handleAddMessage('An error occurred while sending the file!', 'error');
    }
  };

  return (
    <div className="FileTransfer">
      <div className="bar">Send a PDF</div>
      <div className="content">
        <form className="form-container" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fileInput">PDF File</label>
            <input
              id="fileInput"
              style={{ padding: '7px' }}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div>
            <label htmlFor="adminNode">First Seeder</label>
            <select
              id="adminNode"
              value={first_seeder}
              onChange={(e) => setFirstSeeder(e.target.value)}
            >
              <option value="Node1">Node1</option>
              <option value="Node2">Node2</option>
              <option value="Node3">Node3</option>
              <option value="Node4">Node4</option>
              <option value="Node5">Node5</option>
              <option value="Node6">Node6</option>
              <option value="Node7">Node7</option>
              <option value="Node8">Node8</option>
              <option value="Node9">Node9</option>
              <option value="Node10">Node10</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetNode">Target Node</label>
            <select
              id="targetNode"
              value={target_node}
              onChange={(e) => setTargetNode(e.target.value)}
            >
              <option value="Node1">Node1</option>
              <option value="Node2">Node2</option>
              <option value="Node3">Node3</option>
              <option value="Node4">Node4</option>
              <option value="Node5">Node5</option>
              <option value="Node6">Node6</option>
              <option value="Node7">Node7</option>
              <option value="Node8">Node8</option>
              <option value="Node9">Node9</option>
              <option value="Node10">Node10</option>
            </select>
          </div>

          <button type="submit">Send</button>
        </form>
      </div>
      {showMessage && (
        <div class="MessageBarContainer"><div class={type === 'success' ? 'MessageBar' : 'MessageBarError'}>{message}</div></div>
      )}
    </div>
  );
}

export default FileTransferForm;
