import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { buttonVariants } from './ui/button';

type ConnectionState = 'connecting' | 'connected' | 'null';

export function PcConnectionIcon({ state }: { state: ConnectionState}) {
  const [currentSignalIcon, setCurrentSignalIcon] = useState('signal0');
  const [signalTimeout, setSignalTImeout] = useState<NodeJS.Timeout | null>(null);
  
  const signalIcons = ['signal0', 'signal1', 'signal2', 'signal3', 'signal4'];
  const iconMapping: Record<ConnectionState, string> = {
    'connecting': currentSignalIcon,
    'connected': 'cast',
    'null': 'error'
    // Add more states here
  };

  useEffect(() => {
    if (state === "connecting") {
      let currentSignalIndex = 0;
      setSignalTImeout(() => {
        const intervalId = setInterval(() => {
          setCurrentSignalIcon(signalIcons[currentSignalIndex]);
          currentSignalIndex = (currentSignalIndex + 1) % signalIcons.length;
        }, 500);
        return intervalId})
    } else if (signalTimeout) {
      clearInterval(signalTimeout);
    }

    return () => {if (signalTimeout) {clearInterval(signalTimeout)}};
  }, [state]);

  const IconComponent = Icons[iconMapping[state] as keyof typeof Icons];

  return (
    <div className={buttonVariants({variant: "outline"})}>
      {IconComponent ? <IconComponent className="h-6 w-6" /> : null}
    </div>
  );
}
