import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "[    0.000000] Linux version 6.8.0-nird-sec (root@nird-build) (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC",
  "[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.0-nird root=UUID=1337-CODE ro quiet splash vt.handoff=7",
  "[    0.002341] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'",
  "[    0.002345] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'",
  "[    0.002350] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'",
  "[    0.004112] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
  "[    0.004114] BIOS-e820: [mem 0x000000000009fc00-0x000000000009ffff] reserved",
  "[    0.012000] Console: colour dummy device 80x25",
  "[    0.012440] printk: console [tty0] enabled",
  "[    0.154000] ACPI: Core revision 20230628",
  "[    0.160000] PM: Registering ACPI NVS region [mem 0x7a229000-0x7a267fff]",
  "[    0.200000] Key type blacklist registered",
  "[    0.201000] Freeing SMP alternatives memory: 36K",
  "[    0.345000] smpboot: CPU0: Intel(R) Core(TM) i9-14900K (family: 0x6, model: 0x9e, stepping: 0x9)",
  "[    0.450000] Performance Events: PEBS fmt3+, Skylake events, 32-deep LBR, full-width counters",
  "[    0.500000] NIRD_SEC: Initializing proprietary killer protocols...",
  "[    0.550000] NIRD_SEC: Bypassing Windows Defender... [OK]",
  "[    0.600000] NIRD_SEC: Disabling Telemetry Service... [OK]",
  "[    0.650000] NET: Registered protocol family 16",
  "[    0.800000] pci 0000:00:02.0: vgaarb: setting as boot VGA device",
  "[    1.000000] scsi host0: Ahci",
  "[    1.002000] scsi 0:0:0:0: Direct-Access     NVMe     Samsung SSD 990 1.00 PQ: 0 ANSI: 5",
  "[    1.200000] EXT4-fs (nvme0n1p2): mounted filesystem with ordered data mode. Opts: (null)",
  "[    1.300000] systemd[1]: Detected architecture x86-64.",
  "[    1.400000] systemd[1]: Set hostname to <nird-workstation>.",
  "[    1.500000] [ OK ] Reached target Local File Systems.",
  "[    1.600000] [ OK ] Started Network Manager.",
  "[    1.700000] [ OK ] Started Dispatch Password Requests to Console Directory Watch.",
  "[    1.800000] [ OK ] Reached target Sound Card.",
  "[    2.000000] NIRD_OS: Loading Graphical User Interface...",
  "[    2.200000] NIRD_OS: Checking for bloatware...",
  "[    2.400000] Bloatware detected: 142 processes found.",
  "[    2.500000] WARNING: PROPRIETARY SOFTWARE TRYING TO RESIST DELETION.",
  "[    2.600000] ENGAGING COUNTER-MEASURES...",
  "[    2.800000] SYSTEM OVERRIDE: SUCCESS.",
  "[    3.000000] Starting RunnerGame.service..."
];

const ASCII_ART = `
  _   _  ___ ______  _____         ____  _____ 
 | \ | ||_ _|| ___ \|  _  \       / __ \/  ___|
 |  \| | | | | |_/ /| | | |______ | | | |\ \--. 
 | . \ | | | |    / | | | |______|| | | | \--. \
 | |\  |_| |_| |\ \ | |/ /        | |_| |/\__/ /
 \_| \_/\___/\_| \_||___/          \____/\____/ 
                                                
 v2.0.25 (Stable) - Freedom Edition
`;

const HexColumn = () => {
  const [hex, setHex] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLines = Array(20).fill(0).map(() => 
        `0x${Math.floor(Math.random()*16777215).toString(16).padStart(8, '0')}  ${Math.random() > 0.5 ? 'EF' : '00'} ${Math.random() > 0.5 ? '4A' : 'FF'} ${Math.floor(Math.random()*99)}`
      );
      setHex(newLines);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex flex-col text-[10px] text-emerald-900/50 font-mono h-full justify-center select-none overflow-hidden opacity-50">
      {hex.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let currentIndex = 0;
    
    const printLog = () => {
      if (currentIndex >= BOOT_LOGS.length) {
        timeoutRef.current = window.setTimeout(onComplete, 800);
        return;
      }

      const nextLog = BOOT_LOGS[currentIndex];
      if (nextLog) {
          setLogs(prev => [...prev, nextLog]);
      }
      
      currentIndex++;

      let delay = 30;
      const currentLog = BOOT_LOGS[currentIndex - 1];
      
      if (currentLog?.includes("WARNING")) delay = 600;
      if (currentLog?.includes("Loading")) delay = 400;
      if (currentLog?.includes("OK")) delay = 50;
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      timeoutRef.current = window.setTimeout(printLog, delay);
    };

    timeoutRef.current = window.setTimeout(printLog, 500);

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (Math.random() * 5), 100));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-[#050505] text-emerald-500 font-mono flex flex-col relative overflow-hidden p-4 md:p-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none" />
      <div className="absolute inset-0 shadow-[0_0_100px_rgba(16,185,129,0.1)_inset] pointer-events-none z-40" />

      <div className="flex h-full gap-8 z-10">
        <div className="flex-1 flex flex-col max-w-4xl">
            <motion.pre 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] md:text-xs leading-[1.1] text-emerald-400 mb-6 font-bold select-none whitespace-pre"
            >
                {ASCII_ART}
            </motion.pre>

            <div className="h-px w-full bg-emerald-900 mb-4" />

            <div 
                ref={scrollRef}
                className="flex-1 overflow-hidden font-mono text-sm md:text-base space-y-1 relative"
            >
                {logs.map((log, i) => {
                    if (!log) return null; 

                    const isWarning = log.includes("WARNING") || log.includes("resistance");
                    const isSuccess = log.includes("SUCCESS") || log.includes("OK");
                    
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.1 }}
                            className={`${isWarning ? 'text-red-500 font-bold bg-red-900/10' : ''} ${isSuccess ? 'text-emerald-300' : 'text-emerald-600'}`}
                        >
                            {log}
                        </motion.div>
                    );
                })}
                <div className="w-2 h-4 bg-emerald-500 animate-pulse mt-1 inline-block" />
            </div>
        </div>

        <div className="hidden lg:flex w-64 border-l border-emerald-900 pl-4 flex-col justify-between py-10">
            <div>
                <div className="text-xs text-emerald-700 mb-1">MEMORY_DUMP</div>
                <HexColumn />
            </div>
            
            <div className="space-y-4">
                <div>
                    <div className="text-xs text-emerald-700 mb-1">CPU_TEMP</div>
                    <div className="text-xl text-emerald-400 font-bold">{40 + Math.floor(Math.random() * 20)}°C</div>
                </div>
                <div>
                    <div className="text-xs text-emerald-700 mb-1">SECURE_BOOT</div>
                    <div className="text-xl text-red-500 font-bold animate-pulse">DISABLED</div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-4 border-t border-emerald-900 pt-4 flex items-center gap-4 z-10">
         <div className="text-xs text-emerald-700 whitespace-nowrap">SYSTEM INTEGRITY CHECK</div>
         <div className="h-4 flex-1 bg-emerald-900/30 rounded border border-emerald-900/50 overflow-hidden relative">
            <motion.div 
                className="h-full bg-emerald-500 relative"
                style={{ width: `${progress}%` }}
            >
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
            </motion.div>
         </div>
         <div className="text-xs font-bold text-emerald-400 w-12 text-right">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}