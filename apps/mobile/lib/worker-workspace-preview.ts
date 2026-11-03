export const WORKER_WORKSPACE_DISCLAIMER =
  'Sample preview only. The leads shown here are local examples. This is not a live BrainWorker account, lead feed or push alert service.';

export interface WorkerSampleLead {
  readonly id: string;
  readonly serviceTitle: string;
  readonly category: string;
  readonly problemSummary: string;
  readonly problemDetail: string;
  readonly neighborhood: string;
  readonly landmark: string;
  readonly sampleTimeframe: string;
  readonly sampleUrgency: string;
  readonly sampleBudget: string;
  readonly pricingMode: string;
  readonly postedAgo: string;
}

export interface SampleLeadAlert {
  readonly id: string;
  readonly alertTag: string;
  readonly serviceTitle: string;
  readonly neighborhood: string;
  readonly problemSummary: string;
  readonly sampleUrgency: string;
  readonly sampleBudget: string;
}

export const SAMPLE_WORKER_LEADS: readonly WorkerSampleLead[] = Object.freeze([
  Object.freeze({
    id: 'lead_gen_01',
    serviceTitle: 'Generator Servicing & Repair',
    category: 'Power & Cooling',
    problemSummary: 'Sumec Firman 2.5kVA generator cuts out under load after 10 minutes.',
    problemDetail:
      'Generator starts normally on choke, but stalls as soon as household load is switched on. Oil level checked, suspected carburetor blockage or spark plug degradation.',
    neighborhood: 'Ikeja, Lagos',
    landmark: 'Near Allen Roundabout',
    sampleTimeframe: 'Flexible within 48 hours (sample window)',
    sampleUrgency: 'Standard (sample)',
    sampleBudget: '₦15,000 - ₦25,000 (sample range)',
    pricingMode: 'Estimated labor (sample)',
    postedAgo: 'Sample lead',
  }),
  Object.freeze({
    id: 'lead_ac_02',
    serviceTitle: 'AC Repair & Gas Refill',
    category: 'Power & Cooling',
    problemSummary: 'Split unit blowing warm air, requires refrigerant check and coil inspection.',
    problemDetail:
      '1.5HP Panasonic inverter split AC runs blower fan but outdoor unit cuts off after 3 minutes. Copper pipe has ice buildup, suggesting low refrigerant or leak.',
    neighborhood: 'Lekki Phase 1, Lagos',
    landmark: 'Admiralty Way junction',
    sampleTimeframe: 'Morning slot (sample window)',
    sampleUrgency: 'Prompt (sample)',
    sampleBudget: '₦18,000 - ₦30,000 (sample range)',
    pricingMode: 'Estimated labor (sample)',
    postedAgo: 'Sample lead',
  }),
  Object.freeze({
    id: 'lead_plumb_03',
    serviceTitle: 'Plumbing & Pipe Fitting',
    category: 'Utilities & Structure',
    problemSummary: 'Kitchen sink drain leaking at P-trap fitting with minor water pooling.',
    problemDetail:
      'PVC drain pipe beneath double-bowl kitchen sink has cracked threaded collar. Continuous dripping whenever tap runs, requires replacement P-trap assembly and sealing.',
    neighborhood: 'Surulere, Lagos',
    landmark: 'Off Bode Thomas Street',
    sampleTimeframe: 'Weekend (sample window)',
    sampleUrgency: 'Flexible (sample)',
    sampleBudget: '₦12,000 - ₦20,000 (sample range)',
    pricingMode: 'Estimated labor (sample)',
    postedAgo: 'Sample lead',
  }),
]);

export const SAMPLE_LEAD_ALERT: SampleLeadAlert = Object.freeze({
  id: SAMPLE_WORKER_LEADS[0].id,
  alertTag: 'SAMPLE LEAD ALERT',
  serviceTitle: SAMPLE_WORKER_LEADS[0].serviceTitle,
  neighborhood: SAMPLE_WORKER_LEADS[0].neighborhood,
  problemSummary: SAMPLE_WORKER_LEADS[0].problemSummary,
  sampleUrgency: SAMPLE_WORKER_LEADS[0].sampleUrgency,
  sampleBudget: SAMPLE_WORKER_LEADS[0].sampleBudget,
});

export function getSampleLeadById(id: string): WorkerSampleLead | undefined {
  return SAMPLE_WORKER_LEADS.find((lead) => lead.id === id);
}
