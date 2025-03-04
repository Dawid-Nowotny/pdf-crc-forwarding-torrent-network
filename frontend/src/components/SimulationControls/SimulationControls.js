import { useState } from 'react';
import { startTorrents, startWithFaultyTorrent, stopTorrents, closeNode } from '../../services/api';
import './SimulationControls.css';
import NodeStatusService from '../../services/NodeStatusService';

function SimulationControls() {
  const nodeStatusService = NodeStatusService.getInstance();
  const [close_node, setCloseNode] = useState('Node1'); 
  const [polynomial, setPolynomial] = useState('11111111');

  const [faulty_node, setFaultyNode] = useState('None');
  const [faulty_polynomial, setFaultyPolynomial] = useState('');

  const handleStart = async () => {
    if (polynomial === '') {
      console.log("Musisz wypełnić pole polynomial.");
      return;
    }
  
    if (faulty_node !== 'None' && faulty_polynomial !== '') {
      await startWithFaultyTorrent({ polynomial, faulty_node, faulty_polynomial });
      nodeStatusService.updateAllNodeStatuses(true, false);
      nodeStatusService.updateNodeStatus(faulty_node, true, true);
    } else {
      await startTorrents({ polynomial });
      nodeStatusService.updateAllNodeStatuses(true, false);
    }
    window.location.reload();
  };
  
  

  const handleStop = async () => {
    await stopTorrents();
    nodeStatusService.updateAllNodeStatuses(false, false);
    window.location.reload(); 
  };

  const handleClose = async () => {
    await closeNode(close_node);
    nodeStatusService.updateNodeStatus(close_node, false, false);
    //window.location.reload(); 
  };

  return (
    <div class="SimulationControls">
      <div class="bar">Simulation Controls</div>
      <div class="content">
        <div class="form-container">
        <div>
            <label htmlFor="polynomial">Polynomial (8-bit number)</label>
            <input
              id="polynomial"
              type="text"
              placeholder="Polynomial (8-bit number)"
              value={polynomial}
              onChange={(e) => setPolynomial(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="faultyNode">Faulty Node</label>
            <select
              id="faultyNode"
              value={faulty_node}
              onChange={(e) => setFaultyNode(e.target.value)} 
            >
              <option value="None">None</option>
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
            <label htmlFor="polynomial">Faulty Polynomial</label>
            <input
              id="faultyPolynomial"
              type="text"
              placeholder="Faulty Polynomial (8-bit number)"
              value={faulty_polynomial}
              onChange={(e) => setFaultyPolynomial(e.target.value)}
            />
          </div>

          <div class="buttoncontainer">
            <button class="button2" onClick={handleStart}>Start</button>
            <button class="button2" onClick={handleStop}>Stop</button>
          </div>
        </div>
        <div class="form-container" style={{ marginTop: '30px' }}>
          <div>
            <label htmlFor="closeNode">Node to close</label>
            <select
              id="closeNode"
              value={close_node}
              onChange={(e) => setCloseNode(e.target.value)} 
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
          <button class="button" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default SimulationControls;