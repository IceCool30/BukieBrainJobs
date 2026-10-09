'use client';

import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Wrench, X, Zap } from 'lucide-react';

export interface TradeRequisition {
  id: string;
  code: string;
  role: string;
  discipline: 'Power Generation' | 'Solar & Inverters' | 'Plant Automation' | 'Industrial HVAC';
  stack: string[];
  workshop: string;
  location: string;
  compensation: string;
  escrowStatus: string;
  scopeSummary: string;
  toolingRequired: string[];
  deliverables: string[];
}

export const REQUISITION_DATA: TradeRequisition[] = [
  {
    id: 'req-1',
    code: 'REQ-8820',
    role: 'Industrial Diesel Generator Overhaul Lead',
    discipline: 'Power Generation',
    stack: ['Perkins 500kVA', 'AVR Calibration', 'Injector Timing', 'Deep Sea DSE7320'],
    workshop: 'Niger Industrial Heavy Machinery Bay 04',
    location: 'Ikeja, Lagos',
    compensation: '₦2,800,000 / milestone',
    escrowStatus: '100% Escrow Protected',
    scopeSummary: 'Complete top and bottom overhaul on standby Perkins 500kVA units. Rebuild injection pumps, dynamic timing calibration, and program DSE7320 controllers for synchronised busbar load sharing.',
    toolingRequired: ['Micrometer bore gauges', 'Digital timing light & diesel tachometer', 'Calibrated torque wrenches (up to 400 Nm)', 'DSE PC diagnostic harness'],
    deliverables: ['Factory-tolerance bore & crank measurements', '4-hour continuous resistive load test at 100%', 'Cold start and automatic transfer certification'],
  },
  {
    id: 'req-2',
    code: 'REQ-8821',
    role: 'High-Voltage Solar Microgrid Technician',
    discipline: 'Solar & Inverters',
    stack: ['Victron Quattro 15kVA', 'Freedom Won LiFePO4', 'Fronius Symo', 'Modbus TCP'],
    workshop: 'Apex Microgrid Engineering Facility',
    location: 'Lekki Phase 1, Lagos',
    compensation: '₦3,400,000 / milestone',
    escrowStatus: '100% Escrow Protected',
    scopeSummary: 'Commission 45kVA 3-phase hybrid microgrid with 60kWh high-voltage lithium storage. Establish Cerbo GX telemetry, balance DC strings, and verify zero-export grid compliance.',
    toolingRequired: ['Fluke 1507 Insulation Resistance Tester', 'True-RMS DC/AC Clamp Meter', 'Solar irradiance pyranometer', 'Ethernet Modbus analyzer'],
    deliverables: ['String VOC and ISC sign-off sheet', 'Battery BMS firmware and thermal balance report', 'VRM cloud remote monitoring handover'],
  },
  {
    id: 'req-3',
    code: 'REQ-8822',
    role: 'Industrial PLC & SCADA Automator',
    discipline: 'Plant Automation',
    stack: ['Siemens S7-1500', 'TIA Portal V18', 'WinCC SCADA', 'Profinet IO'],
    workshop: 'Trans-Amadi Beverage Plant Line 2',
    location: 'Trans-Amadi, Port Harcourt',
    compensation: '₦4,200,000 / milestone',
    escrowStatus: '100% Escrow Protected',
    scopeSummary: 'Reprogram bottle-washing and packaging conveyance lines. Integrate safety light curtains, tune VFD PID velocity loops over Profinet, and deploy batch recipe management.',
    toolingRequired: ['Industrial Ethernet sniffer / Wireshark', 'Fluke ScopeMeter 190 Series', 'Siemens field PG or engineered programming rig', 'Multi-turn calibrated calibrator (4-20mA)'],
    deliverables: ['Structured text PLC project archive & symbol table', 'Zero-downtime line changeover validation', 'Operator alarm priority runbook'],
  },
  {
    id: 'req-4',
    code: 'REQ-8823',
    role: 'Commercial Chiller & VRF HVAC Lead',
    discipline: 'Industrial HVAC',
    stack: ['Daikin VRV IV', 'Carrier 30XA Chiller', 'R410A Reclaim', 'BMS BACnet'],
    workshop: 'Federal Towers Mechanical Plant Room',
    location: 'Central Business District, Abuja',
    compensation: '₦3,100,000 / milestone',
    escrowStatus: '100% Escrow Protected',
    scopeSummary: 'Vacuum decay test to 250 microns, dry nitrogen pressure test at 550 PSI, and recover/charge 85kg R410A across 3 multi-split condensers with building management system integration.',
    toolingRequired: ['Digital micron vacuum gauge', 'Two-stage rotary vane vacuum pump', 'R410A recovery machine with certified cylinders', 'Electronic refrigerant scales (0.01 kg resolution)'],
    deliverables: ['24-hour nitrogen holding pressure logs', 'Subcooling and superheat balance curves', 'BMS temperature control loop validation'],
  },
];

const DISCIPLINES = [
  'All',
  'Power Generation',
  'Solar & Inverters',
  'Plant Automation',
  'Industrial HVAC',
] as const;

export default function TradesRequisitionBoard() {
  const [activeDiscipline, setActiveDiscipline] = useState<string>('All');
  const [selectedReq, setSelectedReq] = useState<TradeRequisition | null>(null);
  const [bookedReq, setBookedReq] = useState<string | null>(null);

  const filteredRequisitions = REQUISITION_DATA.filter((req) => {
    if (activeDiscipline === 'All') return true;
    return req.discipline === activeDiscipline;
  });

  return (
    <section
      id="trades-index"
      className="w-full py-12 sm:py-16 bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200 border-t border-[var(--lead)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--brand-green)] uppercase tracking-wider mb-2">
              <span className="telemetry-beacon flex-shrink-0" aria-hidden="true" />
              <span>LIVE TECHNICAL DISPATCH</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-trades text-[var(--text-main)]">
              TECHNICAL REQUISITION INDEX
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl">
              Calibrated industrial requisitions vetted for licensed trades, verified tooling kits, and 100% escrow milestone protection.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end text-xs font-mono text-[var(--text-muted)] bg-[var(--card-bg)] px-3 py-1.5 rounded-lg border border-[var(--lead)]">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-green)]" />
            <span>DISPATCH POOL: {filteredRequisitions.length} VERIFIED TRADES</span>
          </div>
        </div>

        {/* Station Toolbar: Discipline Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-[var(--lead)]">
          {DISCIPLINES.map((discipline) => {
            const isActive = activeDiscipline === discipline;
            return (
              <button
                key={discipline}
                type="button"
                onClick={() => setActiveDiscipline(discipline)}
                className={`motion-press px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--text-main)] text-[var(--bg)] font-bold shadow-xs'
                    : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--lead)] hover:border-[var(--rule)] hover:text-[var(--text-main)]'
                }`}
              >
                {discipline}
              </button>
            );
          })}
        </div>

        {/* Command Table (Desktop & Tablet) */}
        <div className="overflow-x-auto rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b border-[var(--lead)] text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">REF ID</th>
                <th className="py-3.5 px-4 font-semibold">ROLE & TECHNICAL STACK</th>
                <th className="py-3.5 px-4 font-semibold hidden md:table-cell">WORKSHOP / LOCATION</th>
                <th className="py-3.5 px-4 font-semibold">MILESTONE & ESCROW</th>
                <th className="py-3.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lead)] text-sm">
              {filteredRequisitions.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-[var(--card-hover)] transition-colors group cursor-pointer"
                  onClick={() => setSelectedReq(req)}
                >
                  {/* REF ID */}
                  <td className="py-4 px-4 font-mono font-bold text-xs text-[var(--amber)] whitespace-nowrap align-top">
                    {req.code}
                  </td>

                  {/* Role & Tech Stack Tags */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-display font-bold text-base text-[var(--text-main)] mb-1 group-hover:text-[var(--amber)] transition-colors">
                      {req.role}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {req.stack.map((item) => (
                        <span
                          key={item}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Workshop / Location */}
                  <td className="py-4 px-4 hidden md:table-cell align-top text-xs">
                    <div className="font-medium text-[var(--text-main)]">{req.workshop}</div>
                    <div className="text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                      <span>{req.location}</span>
                    </div>
                  </td>

                  {/* Milestone & Escrow */}
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    <div className="font-mono font-bold text-sm text-[var(--text-main)]">
                      {req.compensation}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--brand-green)] mt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{req.escrowStatus}</span>
                    </div>
                  </td>

                  {/* Action CTA */}
                  <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReq(req);
                      }}
                      className="motion-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all bg-[var(--amber)] text-white hover:bg-[var(--amber-hover)] shadow-xs"
                    >
                      <span>INSPECT SPEC</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Protocol Callout Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--lead)] hover:border-[var(--brand-green)] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand-green)] font-bold mb-1">
              <Wrench className="w-4 h-4" />
              <span>01. BENCH & RIG VETTING</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every BrainWorker lead provides proof of calibrated diagnostic instruments and physical workshop tooling before requisition access.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--lead)] hover:border-[var(--brand-green)] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand-green)] font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>02. MILESTONE ESCROW LOCK</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Project compensation is locked in BukieGuarantee™ escrow prior to site commencement and disbursed strictly on physical sign-off.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--lead)] hover:border-[var(--brand-green)] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand-green)] font-bold mb-1">
              <Zap className="w-4 h-4" />
              <span>03. DIRECT ENGINEERING LINK</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Direct technical dispatch link to facilities managers and workshop supervisors without intermediary markup or communications lag.
            </p>
          </div>
        </div>
      </div>

      {/* Spec Inspection Modal / Drawer */}
      {selectedReq && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Specification for ${selectedReq.code}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] text-[var(--text-main)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--lead)] mb-5">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-[var(--amber)] font-bold mb-1">
                  <span>{selectedReq.code}</span>
                  <span className="text-[var(--text-muted)]">{'//'}</span>
                  <span className="text-[var(--text-muted)]">{selectedReq.discipline}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                  {selectedReq.role}
                </h3>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                  {selectedReq.workshop} - {selectedReq.location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                aria-label="Close spec drawer"
                className="motion-press p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope Summary */}
            <div className="mb-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-semibold">
                TECHNICAL SPECIFICATION DOSSIER
              </h4>
              <p className="text-sm text-[var(--text-main)] leading-relaxed bg-[var(--tag-bg)] p-3 rounded-lg border border-[var(--lead)]">
                {selectedReq.scopeSummary}
              </p>
            </div>

            {/* Required Tooling */}
            <div className="mb-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">
                CALIBRATED TOOLING & INSTRUMENTATION REQUIRED
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-main)]">
                {selectedReq.toolingRequired.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-green)] flex-shrink-0" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Deliverables */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">
                ACCEPTANCE & MILESTONE DELIVERABLES
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-main)]">
                {selectedReq.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer with Compensation and Action */}
            <div className="pt-4 border-t border-[var(--lead)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)]">GUARANTEED ESCROW MILESTONE</div>
                <div className="text-lg font-mono font-bold text-[var(--text-main)]">{selectedReq.compensation}</div>
                <div className="text-[11px] font-mono text-[var(--brand-green)] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>BukieGuarantee™ Escrow Ready</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="motion-press px-4 py-2.5 rounded-lg border border-[var(--lead)] text-xs font-mono text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors flex-1 sm:flex-initial"
                >
                  DISMISS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookedReq(selectedReq.code);
                    setTimeout(() => {
                      setSelectedReq(null);
                      setBookedReq(null);
                    }, 1200);
                  }}
                  className="motion-press px-5 py-2.5 rounded-lg bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-white text-xs font-mono font-bold tracking-wide uppercase transition-colors shadow-sm flex-1 sm:flex-initial"
                >
                  {bookedReq === selectedReq.code ? 'CREDENTIALS DISPATCHED' : 'BOOK OPPORTUNITY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
