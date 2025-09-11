import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import Percentage from "./Percentage";

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
    <Paper elevation={3} sx={{ py: 5, px: 4, borderRadius: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={"bold"} variant="h6">
              {isMoney ? "" : ""} {number}
            </Typography>
          </Box>
          <Box>
            {percentage !== undefined && upOrDown && (
              <Percentage
                percentage={percentage}
                upOrDown={upOrDown}
                color={color}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={"light"} variant="h6">
              {title}
            </Typography>
          </Box>
          <Box>
            {percentage !== undefined && subTitle && (
              <Typography 
                fontWeight={"light"} 
                variant="caption" 
                color={getColorValue(color)}
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
