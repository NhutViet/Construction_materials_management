import React from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface PaidStampProps {
  visible: boolean;
}

const PaidStamp: React.FC<PaidStampProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        transform: 'rotate(-15deg)',
        zIndex: 10,
        opacity: 0.8,
        animation: 'stampAppear 0.6s ease-out',
        '@keyframes stampAppear': {
          '0%': {
            opacity: 0,
            transform: 'rotate(-15deg) scale(0.5)',
          },
          '50%': {
            opacity: 0.8,
            transform: 'rotate(-15deg) scale(1.1)',
          },
          '100%': {
            opacity: 0.8,
            transform: 'rotate(-15deg) scale(1)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '4px solid #4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: '50%',
            border: '2px solid #4caf50',
            opacity: 0.3,
          },
        }}
      >
        <CheckCircle 
          sx={{ 
            fontSize: 40, 
            color: '#4caf50',
            mb: 0.5,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }} 
        />
        <Typography
          variant="caption"
          sx={{
            color: '#4caf50',
            fontWeight: 'bold',
            fontSize: '10px',
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          ĐÃ THANH TOÁN
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#4caf50',
            fontWeight: 'bold',
            fontSize: '8px',
            textAlign: 'center',
            lineHeight: 1,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          PAID
        </Typography>
      </Box>
    </Box>
  );
};

export default PaidStamp;
