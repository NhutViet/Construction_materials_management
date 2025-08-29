// ApexCharts type declarations to fix chart type errors

declare module 'react-apexcharts' {
  import React from 'react';
  
  interface ApexOptions {
    chart?: {
      id?: string;
      type?: 'area' | 'line' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
      stacked?: boolean;
    };
    dataLabels?: {
      enabled?: boolean;
    };
    legend?: {
      position?: 'top' | 'right' | 'bottom' | 'left';
      horizontalAlign?: string;
      offsetY?: number;
      fontSize?: string;
      customLegendItems?: string[];
    };
    title?: {
      text?: string;
      align?: string;
      style?: {
        fontSize?: string;
        color?: string;
      };
    };
    plotOptions?: {
      bar?: {
        columnWidth?: string;
        horizontal?: boolean;
      };
    };
    fill?: any;
    xaxis?: any;
    tooltip?: any;
    colors?: string[];
    stroke?: any;
    subtitle?: any;
  }
  
  interface Props {
    options?: ApexOptions;
    series?: any[];
    type?: string;
    width?: string | number;
    height?: string | number;
  }
  
  const ReactApexChart: React.ComponentType<Props>;
  export default ReactApexChart;
}
