'use client';
import { createContext, useContext, useMemo, useState } from 'react';

type TAnchorPoint = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

interface IFloatingStateContext {
  isVisible: boolean;
}

interface IFloatingFunctionContext {
  setIsVisible: (isVisible: boolean) => void;
  setPosition: (position: {
    anchorPoint: TAnchorPoint;
    x: number;
    y: number;
  }) => void;
  setNode: (node: React.ReactNode) => void;
}

const FloatingStateContext = createContext<IFloatingStateContext | undefined>(
  undefined
);
const FloatingFunctionContext = createContext<
  IFloatingFunctionContext | undefined
>(undefined);

export const useFloatingState = () => {
  const context = useContext(FloatingStateContext);

  if (!context) {
    throw new Error('useFloating must be used within a FloatingProvider');
  }

  return context;
};

export const useFloatingFunction = () => {
  const context = useContext(FloatingFunctionContext);

  if (!context) {
    throw new Error('useFloating must be used within a FloatingProvider');
  }

  return context;
};

export const FloatingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{
    anchorPoint: TAnchorPoint;
    x: number;
    y: number;
  }>({ anchorPoint: 'bottom-right', x: 0, y: 0 });

  const [node, setNode] = useState<React.ReactNode>(<></>);

  const positionStyle = useMemo(() => {
    switch (position.anchorPoint) {
      case 'bottom-left':
        return { bottom: `${position.y}px`, left: `${position.x}px` };
      case 'bottom-right':
        return { bottom: `${position.y}px`, right: `${position.x}px` };
      case 'top-left':
        return { top: `${position.y}px`, left: `${position.x}px` };
      case 'top-right':
        return { top: `${position.y}px`, right: `${position.x}px` };
    }
  }, [position]);

  // TODO: floating 요소 구현 할 것
  return (
    <FloatingStateContext.Provider value={{ isVisible }}>
      <FloatingFunctionContext.Provider
        value={{ setIsVisible, setPosition, setNode }}
      >
        <div
          className={`tw-fixed ${isVisible ? '' : 'tw-hidden'}`}
          style={positionStyle}
        >
          {node}
        </div>
        {children}
      </FloatingFunctionContext.Provider>
    </FloatingStateContext.Provider>
  );
};
