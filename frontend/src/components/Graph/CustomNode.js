import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function CustomNode({ data }) {
  return (
    <div style={{
      border: '1px solid black',
      borderRadius: '8px',
      padding: '10px',
      textAlign: 'center',
      background: '#f9f9f9',
      width: '100px',
    }}>
       <div style={{
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: data.online ? 'green' : 'red', // Zielona/czerwona kropka
        position: 'absolute',
        top: '5px',
        right: '5px'
      }}></div>
        {data.faulty &&
        <div style={{
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          backgroundColor: 'yellow',
          position: 'absolute',
          top: '5px',
          right: '25px'
        }}></div>}
      <div>
        <img 
          src={data.image || "https://images.emojiterra.com/google/android-nougat/512px/1f5a5.png"}
          alt="node-icon" 
          style={{ width: '50px', height: '50px', marginBottom: '10px' }}
        />
      </div>
      <div>
        <div>{data.label || "Unnamed"}</div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
}

export default memo(CustomNode);
