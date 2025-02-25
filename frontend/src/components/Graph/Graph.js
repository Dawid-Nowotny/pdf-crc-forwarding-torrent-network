import React from 'react';
import logService from '../../services/LogService';
import './Graph.css';

import { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
 
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  { id: 'Node1', type: 'custom', position: { x: 15, y: 100 }, data: { label: 'Node1' } },
  { id: 'Node2', type: 'custom', position: { x: 215, y: 50 }, data: { label: 'Node2' } },
  { id: 'Node3', type: 'custom', position: { x: 215, y: 250 }, data: { label: 'Node3' } },
  { id: 'Node4', type: 'custom', position: { x: 415, y: 50 }, data: { label: 'Node4' } },
  { id: 'Node5', type: 'custom', position: { x: 415, y: 250 }, data: { label: 'Node5' } },
  { id: 'Node6', type: 'custom', position: { x: 615, y: 150 }, data: { label: 'Node6' } },
  { id: 'Node7', type: 'custom', position: { x: 815, y: 250 }, data: { label: 'Node7' } },
  { id: 'Node8', type: 'custom', position: { x: 1015, y: 50 }, data: { label: 'Node8' } },
  { id: 'Node9', type: 'custom', position: { x: 1015, y: 250 }, data: { label: 'Node9' } },
  { id: 'Node10', type: 'custom', position: { x: 1215, y: 250 }, data: { label: 'Node10' } },
];

const initialEdges = [
  { id: 'e1-2', source: 'Node1', target: 'Node2' },
  { id: 'e1-3', source: 'Node1', target: 'Node3' },
  { id: 'e2-4', source: 'Node2', target: 'Node4' },
  { id: 'e3-5', source: 'Node3', target: 'Node5' },
  { id: 'e4-5', source: 'Node4', target: 'Node5' },
  { id: 'e5-6', source: 'Node5', target: 'Node6' },
  { id: 'e6-7', source: 'Node6', target: 'Node7' },
  { id: 'e8-7', source: 'Node8', target: 'Node7' },
  { id: 'e8-9', source: 'Node8', target: 'Node9' },
  { id: 'e9-10', source: 'Node9', target: 'Node10'},
  { id: 'e4-6', source: 'Node4', target: 'Node6' },
  { id: 'e5-7', source: 'Node5', target: 'Node7' },
  { id: 'e2-8', source: 'Node2', target: 'Node8' },
];

const Graph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const colorGraph = () => {
    const logs = logService.getLogs();
    logs.forEach((log, index) => {
      if (index < logs.length - 1) {
        const currentNode = log.node;
        const nextNode = logs[index + 1].node || logs[index + 1].details?.target_node;

        setEdges((prevEdges) =>
          prevEdges.map((edge) => {
              if (
                  (edge.source === currentNode && edge.target === nextNode) ||
                  (edge.source === nextNode && edge.target === currentNode)
              ) {
                  const isForward = edge.source === currentNode && edge.target === nextNode;
                  const isSuccess = logs[index + 1].status === "CRC_SUCCESS";
                  return {
                      ...edge,
                      style: { 
                          ...edge.style, 
                          stroke: isSuccess ? '#00FF00' : '#FF0000',
                          strokeWidth: 2 
                      },
                      animated: true,
                      markerEnd: isForward ? { type: 'arrowclosed', color: isSuccess ? '#00FF00' : '#FF0000' } : undefined,
                      markerStart: !isForward ? { type: 'arrowclosed', color: isSuccess ? '#00FF00' : '#FF0000' } : undefined
                  };
              }
              return edge;
          })
        );
      }
    });
  };

  const resetGraph = () => {
    return new Promise((resolve) => {
      setEdges(initialEdges);
      
      resolve();
    });
  };

  useEffect(() => {
    const handleLogChange = () => {
      if (logService.getShouldColorGraph()) {
        resetGraph();
        colorGraph();
      }
      else {
        resetGraph();
      }
    };

    logService.subscribe(handleLogChange);
    return () => logService.unsubscribe(handleLogChange);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} class="content_graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      />
    </div>
  );
};

export default Graph;
