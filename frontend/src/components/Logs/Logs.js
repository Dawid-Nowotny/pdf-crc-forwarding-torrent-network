import React, { useState, useEffect } from 'react';
import logService from '../../services/LogService';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  useEffect(() => {
    const handleNewLogs = (newLogs) => {
      setLogs([...newLogs]);

      const errorLog = newLogs.find(
        (log) => log.status === 'ERROR' || log.status === 'CONNECTION_FAILED'
      );
      if (errorLog) {
        let errorMessage = errorLog.details?.message || 'An error occurred.';
        setMessage(errorMessage);
        setType('error');
        setShowMessage(true);
      }
    };

    logService.subscribe(handleNewLogs);
    logService.openConnection();

    return () => {
      logService.unsubscribe(handleNewLogs);
      logService.closeConnection();
    };
  }, []);

  const toggleExpandLog = (index) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="Logs">
      {showMessage && (
        <div className="MessageBarContainer">
          <div className={type === 'success' ? 'MessageBar' : 'MessageBarError'}>
            {message}
          </div>
        </div>
      )}
      <div className="bar">Logs</div>
      <div className="log-container">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <div className="expand-container">
              <span>
                <strong>Current Node:</strong> "{log.current_node}", 
                <strong> Status:</strong> "{log.status}"
              </span>
              <button onClick={() => toggleExpandLog(index)} className="expand-button">
                {expandedLogs[index] ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {expandedLogs[index] && log.details && (
              <pre className="expanded-log">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;
