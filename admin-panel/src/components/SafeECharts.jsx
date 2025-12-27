import { useRef } from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * SafeECharts - Wrapper around ReactECharts to handle cleanup issues
 * Prevents "Cannot read properties of undefined (reading 'disconnect')" errors
 */
const SafeECharts = ({ option, style, className, ...props }) => {
  const chartRef = useRef(null);

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={style}
      className={className}
      autoResize={false}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: 'svg' }}
      {...props}
    />
  );
};

export default SafeECharts;
