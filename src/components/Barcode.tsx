import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  format?: string;
  height?: number;
  width?: number;
  fontSize?: number;
  displayValue?: boolean;
  className?: string;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  format = 'CODE128',
  height = 50,
  width = 1.8,
  fontSize = 14,
  displayValue = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: 4,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [value, format, height, width, fontSize, displayValue]);

  return <svg ref={svgRef} className={className} id={`barcode-${value}`} />;
};
