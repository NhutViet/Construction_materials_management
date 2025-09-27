import { Box, Paper, Typography, Tooltip } from "@mui/material";
import React from "react";
import Percentage from "./Percentage";
import { getShortCurrencyWords } from "../../../utils/numberToWords";

interface RevenueCardProps {
  card: {
    number: string;
    percentage?: number;
    upOrDown?: "up" | "down";
    color: "green" | "red" | "success" | "error" | "warning" | "info";
    title: string;
    subTitle?: string;
    isMoney?: boolean;
  };
}

const RevenueCard: React.FC<RevenueCardProps> = ({ card }) => {
  const { number, percentage, upOrDown, color, title, subTitle, isMoney } = card;

  // Extract numeric value from formatted number string
  const getNumericValue = (numStr: string): number => {
    const cleanStr = numStr.replace(/[^\d]/g, '');
    return parseInt(cleanStr) || 0;
  };

  // Get currency words for money values
  const getCurrencyWords = (numStr: string): string => {
    if (!isMoney) return '';
    const numericValue = getNumericValue(numStr);
    if (numericValue === 0) return '';
    return getShortCurrencyWords(numericValue);
  };

  const getColorValue = (color: string) => {
    switch (color) {
      case "green":
      case "success":
        return "success";
      case "red":
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "textPrimary";
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        py: { xs: 3, sm: 4, md: 5 }, 
        px: { xs: 2, sm: 3, md: 4 }, 
        borderRadius: 2,
        height: '100%',
        minHeight: { xs: '120px', sm: '140px', md: '160px' }
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: '100%' }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          mb: 1
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              fontWeight={"bold"} 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}
            >
              {isMoney ? "" : ""} {number}
            </Typography>
            {isMoney && getCurrencyWords(number) && (
              <Tooltip title={getCurrencyWords(number)} arrow placement="top">
                <Typography 
                  variant="caption"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    display: 'block',
                    mt: 0.5,
                    cursor: 'help'
                  }}
                >
                  {getCurrencyWords(number)}
                </Typography>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ ml: 1, flexShrink: 0 }}>
            {percentage !== undefined && upOrDown && (
              <Percentage
                percentage={percentage}
                upOrDown={upOrDown}
                color={color}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end",
          flex: 1
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              fontWeight={"light"} 
              variant="h6"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                wordBreak: 'break-word',
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ ml: 1, flexShrink: 0 }}>
            {percentage !== undefined && subTitle && (
              <Typography 
                fontWeight={"light"} 
                variant="caption" 
                color={getColorValue(color)}
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textAlign: 'right',
                  display: 'block'
                }}
              >
                {subTitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default RevenueCard;
