import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import UilRefresh from "@iconscout/react-unicons/icons/uil-refresh";
import UilExport from "@iconscout/react-unicons/icons/uil-export";

export type PeriodOption = "today" | "week" | "month" | "quarter" | "year" | "custom";

interface DateRangeFilterProps {
  onPeriodChange?: (period: PeriodOption) => void;
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  defaultPeriod?: PeriodOption;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onPeriodChange,
  onDateRangeChange,
  onRefresh,
  onExport,
  defaultPeriod = "month",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(defaultPeriod);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handlePeriodChange = (period: PeriodOption) => {
    setSelectedPeriod(period);
    setStartDate(null);
    setEndDate(null);

    if (period !== "custom") {
      const today = new Date();
      let start: Date;

      switch (period) {
        case "today":
          start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          break;
        case "week":
          start = new Date(today);
          start.setDate(today.getDate() - 7);
          break;
        case "month":
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(today.getMonth() / 3);
          start = new Date(today.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          start = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      onPeriodChange?.(period);
      onDateRangeChange?.(start, today);
    }
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setSelectedPeriod("custom");
      onPeriodChange?.("custom");
      onDateRangeChange?.(start, end);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mr: 1 }}>
          📊 DASHBOARD
        </Typography>

        <ButtonGroup variant="outlined" size="small">
          <Button
            onClick={() => handlePeriodChange("today")}
            variant={selectedPeriod === "today" ? "contained" : "outlined"}
          >
            Hôm nay
          </Button>
          <Button
            onClick={() => handlePeriodChange("week")}
            variant={selectedPeriod === "week" ? "contained" : "outlined"}
          >
            Tuần này
          </Button>
          <Button
            onClick={() => handlePeriodChange("month")}
            variant={selectedPeriod === "month" ? "contained" : "outlined"}
          >
            Tháng này
          </Button>
          <Button
            onClick={() => handlePeriodChange("quarter")}
            variant={selectedPeriod === "quarter" ? "contained" : "outlined"}
          >
            Quý này
          </Button>
          <Button
            onClick={() => handlePeriodChange("year")}
            variant={selectedPeriod === "year" ? "contained" : "outlined"}
          >
            Năm nay
          </Button>
          <Button
            onClick={() => handlePeriodChange("custom")}
            variant={selectedPeriod === "custom" ? "contained" : "outlined"}
          >
            Tùy chọn
          </Button>
        </ButtonGroup>

        {selectedPeriod === "custom" && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                handleDateRangeChange(date, endDate);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <Typography>đến</Typography>
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                handleDateRangeChange(startDate, date);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
              inputProps={{
                min: startDate ? startDate.toISOString().split('T')[0] : undefined,
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {onRefresh && (
          <IconButton onClick={onRefresh} color="primary" size="small">
            <UilRefresh size={20} />
          </IconButton>
        )}
        {onExport && (
          <IconButton onClick={onExport} color="primary" size="small">
            <UilExport size={20} />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default DateRangeFilter;

