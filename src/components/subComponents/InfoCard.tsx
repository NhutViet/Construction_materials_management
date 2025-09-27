import React from 'react';
import { Card, Box, CardContent, Typography } from "@mui/material";

const InfoCard: React.FC<{ card: any }> = ({ card }) => {
  return (
    //do the routing here
    <>
      <Card 
        elevation={6} 
        sx={{ 
          mx: { xs: 0, sm: card.mx }, 
          my: card.my, 
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          flex: 1,
          p: { xs: 1, sm: 2 }
        }}>
          <Box
            p={{ xs: 0.5, sm: 1 }}
            m={{ xs: 1, sm: 2 }}
            sx={{
              display: "flex",
              bgcolor: "primary.main",
              borderRadius: 2,
              alignItems: "center",
              minWidth: { xs: 40, sm: 60 },
              minHeight: { xs: 40, sm: 60 },
              justifyContent: 'center'
            }}
          >
            <Box sx={{ 
              transform: { xs: 'scale(0.7)', sm: 'scale(1)' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {card.icon}
            </Box>
          </Box>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              justifyContent: "center",
              flex: 1,
              p: { xs: 1, sm: 2 },
              '&:last-child': { pb: { xs: 1, sm: 2 } }
            }}
          >
            <Typography 
              variant="h6" 
              color="text.secondary" 
              component="div"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                fontWeight: { xs: 'medium', sm: 'normal' }
              }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={"bolder"}
              color="text.secondary"
              component="div"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                wordBreak: 'break-word'
              }}
            >
              {card.subTitle}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </>
  );
}

export default InfoCard;
