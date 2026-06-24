import { NextResponse } from 'next/server';

const guidelines = [
  {
    "id": "gl_1",
    "title": "AHA/ACC Guidelines for Hypertension",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypertension.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypertension.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Hypertension+pdf"
  },
  {
    "id": "gl_2",
    "title": "AHA/ACC Guidelines for Heart Failure",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Heart Failure.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Heart Failure.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Heart+Failure+pdf"
  },
  {
    "id": "gl_3",
    "title": "AHA/ACC Guidelines for Atrial Fibrillation",
    "specialty": "Cardiology",
    "year": 2022,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Atrial Fibrillation.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Atrial Fibrillation.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Atrial+Fibrillation+pdf"
  },
  {
    "id": "gl_4",
    "title": "AHA/ACC Guidelines for Myocardial Infarction",
    "specialty": "Cardiology",
    "year": 2023,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Myocardial Infarction.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Myocardial Infarction.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Myocardial+Infarction+pdf"
  },
  {
    "id": "gl_5",
    "title": "AHA/ACC Guidelines for Stable Angina",
    "specialty": "Cardiology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Stable Angina.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Stable Angina.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Stable+Angina+pdf"
  },
  {
    "id": "gl_6",
    "title": "AHA/ACC Guidelines for Valvular Disease",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Valvular Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Valvular Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Valvular+Disease+pdf"
  },
  {
    "id": "gl_7",
    "title": "AHA/ACC Guidelines for Dyslipidemia",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Dyslipidemia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Dyslipidemia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Dyslipidemia+pdf"
  },
  {
    "id": "gl_8",
    "title": "AHA/ACC Guidelines for Aortic Aneurysm",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Aortic Aneurysm.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Aortic Aneurysm.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Aortic+Aneurysm+pdf"
  },
  {
    "id": "gl_9",
    "title": "AHA/ACC Guidelines for Endocarditis",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Endocarditis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Endocarditis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Endocarditis+pdf"
  },
  {
    "id": "gl_10",
    "title": "AHA/ACC Guidelines for Pericarditis",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pericarditis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pericarditis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Pericarditis+pdf"
  },
  {
    "id": "gl_11",
    "title": "AHA/ACC Guidelines for Hypertrophic Cardiomyopathy",
    "specialty": "Cardiology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypertrophic Cardiomyopathy.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypertrophic Cardiomyopathy.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Hypertrophic+Cardiomyopathy+pdf"
  },
  {
    "id": "gl_12",
    "title": "AHA/ACC Guidelines for Peripheral Arterial Disease",
    "specialty": "Cardiology",
    "year": 2022,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Peripheral Arterial Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Peripheral Arterial Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Peripheral+Arterial+Disease+pdf"
  },
  {
    "id": "gl_13",
    "title": "AHA/ACC Guidelines for Cardiogenic Shock",
    "specialty": "Cardiology",
    "year": 2023,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cardiogenic Shock.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cardiogenic Shock.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Cardiogenic+Shock+pdf"
  },
  {
    "id": "gl_14",
    "title": "AHA/ACC Guidelines for Pulmonary Hypertension",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pulmonary Hypertension.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pulmonary Hypertension.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Pulmonary+Hypertension+pdf"
  },
  {
    "id": "gl_15",
    "title": "AHA/ACC Guidelines for Syncope",
    "specialty": "Cardiology",
    "year": 2022,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Syncope.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Syncope.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Syncope+pdf"
  },
  {
    "id": "gl_16",
    "title": "AHA/ACC Guidelines for Ventricular Arrhythmias",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ventricular Arrhythmias.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ventricular Arrhythmias.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Ventricular+Arrhythmias+pdf"
  },
  {
    "id": "gl_17",
    "title": "AHA/ACC Guidelines for Pacemaker Indications",
    "specialty": "Cardiology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pacemaker Indications.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pacemaker Indications.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Pacemaker+Indications+pdf"
  },
  {
    "id": "gl_18",
    "title": "AHA/ACC Guidelines for Aortic Dissection",
    "specialty": "Cardiology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Aortic Dissection.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Aortic Dissection.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Aortic+Dissection+pdf"
  },
  {
    "id": "gl_19",
    "title": "AHA/ACC Guidelines for DVT Prophylaxis",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of DVT Prophylaxis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for DVT Prophylaxis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+DVT+Prophylaxis+pdf"
  },
  {
    "id": "gl_20",
    "title": "AHA/ACC Guidelines for Myocarditis",
    "specialty": "Cardiology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Myocarditis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Myocarditis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Myocarditis+pdf"
  },
  {
    "id": "gl_21",
    "title": "AHA/ACC Guidelines for Congenital Heart Disease in Adults",
    "specialty": "Cardiology",
    "year": 2023,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Congenital Heart Disease in Adults.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Congenital Heart Disease in Adults.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Congenital+Heart+Disease+in+Adults+pdf"
  },
  {
    "id": "gl_22",
    "title": "AHA/ACC Guidelines for Cardio-Oncology",
    "specialty": "Cardiology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cardio-Oncology.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cardio-Oncology.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Cardio-Oncology+pdf"
  },
  {
    "id": "gl_23",
    "title": "AHA/ACC Guidelines for Sports Cardiology",
    "specialty": "Cardiology",
    "year": 2021,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sports Cardiology.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sports Cardiology.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Sports+Cardiology+pdf"
  },
  {
    "id": "gl_24",
    "title": "AGA Guidelines for Asthma",
    "specialty": "Pulmonology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Asthma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Asthma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Asthma+pdf"
  },
  {
    "id": "gl_25",
    "title": "WHO Guidelines for COPD",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of COPD.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for COPD.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+COPD+pdf"
  },
  {
    "id": "gl_26",
    "title": "WHO Guidelines for Pneumonia",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pneumonia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pneumonia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Pneumonia+pdf"
  },
  {
    "id": "gl_27",
    "title": "ACOG Guidelines for Pulmonary Embolism",
    "specialty": "Pulmonology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pulmonary Embolism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pulmonary Embolism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Pulmonary+Embolism+pdf"
  },
  {
    "id": "gl_28",
    "title": "AHA/ACC Guidelines for Tuberculosis",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Tuberculosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Tuberculosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Tuberculosis+pdf"
  },
  {
    "id": "gl_29",
    "title": "NICE Guidelines for Lung Cancer Screening",
    "specialty": "Pulmonology",
    "year": 2024,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Lung Cancer Screening.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Lung Cancer Screening.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+Lung+Cancer+Screening+pdf"
  },
  {
    "id": "gl_30",
    "title": "ACOG Guidelines for Interstitial Lung Disease",
    "specialty": "Pulmonology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Interstitial Lung Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Interstitial Lung Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Interstitial+Lung+Disease+pdf"
  },
  {
    "id": "gl_31",
    "title": "WHO Guidelines for Obstructive Sleep Apnea",
    "specialty": "Pulmonology",
    "year": 2023,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Obstructive Sleep Apnea.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Obstructive Sleep Apnea.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Obstructive+Sleep+Apnea+pdf"
  },
  {
    "id": "gl_32",
    "title": "ASCO Guidelines for ARDS",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "ASCO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of ARDS.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for ARDS.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO+guidelines+ARDS+pdf"
  },
  {
    "id": "gl_33",
    "title": "AGA Guidelines for Cystic Fibrosis",
    "specialty": "Pulmonology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cystic Fibrosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cystic Fibrosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Cystic+Fibrosis+pdf"
  },
  {
    "id": "gl_34",
    "title": "NICE Guidelines for Bronchiectasis",
    "specialty": "Pulmonology",
    "year": 2024,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Bronchiectasis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Bronchiectasis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+Bronchiectasis+pdf"
  },
  {
    "id": "gl_35",
    "title": "AAP Guidelines for Pleural Effusion",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pleural Effusion.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pleural Effusion.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Pleural+Effusion+pdf"
  },
  {
    "id": "gl_36",
    "title": "NICE Guidelines for Pneumothorax",
    "specialty": "Pulmonology",
    "year": 2021,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pneumothorax.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pneumothorax.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+Pneumothorax+pdf"
  },
  {
    "id": "gl_37",
    "title": "ADA Guidelines for Sarcoidosis",
    "specialty": "Pulmonology",
    "year": 2023,
    "organization": "ADA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sarcoidosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sarcoidosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA+guidelines+Sarcoidosis+pdf"
  },
  {
    "id": "gl_38",
    "title": "WHO Guidelines for Pulmonary Hypertension",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pulmonary Hypertension.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pulmonary Hypertension.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Pulmonary+Hypertension+pdf"
  },
  {
    "id": "gl_39",
    "title": "AGA Guidelines for Occupational Lung Disease",
    "specialty": "Pulmonology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Occupational Lung Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Occupational Lung Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Occupational+Lung+Disease+pdf"
  },
  {
    "id": "gl_40",
    "title": "NICE Guidelines for Alpha-1 Antitrypsin Deficiency",
    "specialty": "Pulmonology",
    "year": 2020,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Alpha-1 Antitrypsin Deficiency.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Alpha-1 Antitrypsin Deficiency.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+Alpha-1+Antitrypsin+Deficiency+pdf"
  },
  {
    "id": "gl_41",
    "title": "AGA Guidelines for Pulmonary Fibrosis",
    "specialty": "Pulmonology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pulmonary Fibrosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pulmonary Fibrosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Pulmonary+Fibrosis+pdf"
  },
  {
    "id": "gl_42",
    "title": "KDIGO Guidelines for Non-TB Mycobacteria",
    "specialty": "Pulmonology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Non-TB Mycobacteria.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Non-TB Mycobacteria.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Non-TB+Mycobacteria+pdf"
  },
  {
    "id": "gl_43",
    "title": "KDIGO Guidelines for Solitary Pulmonary Nodule",
    "specialty": "Pulmonology",
    "year": 2023,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Solitary Pulmonary Nodule.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Solitary Pulmonary Nodule.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Solitary+Pulmonary+Nodule+pdf"
  },
  {
    "id": "gl_44",
    "title": "AAP Guidelines for Ischemic Stroke",
    "specialty": "Neurology",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ischemic Stroke.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ischemic Stroke.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Ischemic+Stroke+pdf"
  },
  {
    "id": "gl_45",
    "title": "WHO Guidelines for Hemorrhagic Stroke",
    "specialty": "Neurology",
    "year": 2022,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hemorrhagic Stroke.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hemorrhagic Stroke.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Hemorrhagic+Stroke+pdf"
  },
  {
    "id": "gl_46",
    "title": "AGA Guidelines for Migraine",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Migraine.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Migraine.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Migraine+pdf"
  },
  {
    "id": "gl_47",
    "title": "IDSA Guidelines for Epilepsy",
    "specialty": "Neurology",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Epilepsy.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Epilepsy.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Epilepsy+pdf"
  },
  {
    "id": "gl_48",
    "title": "AHA/ACC Guidelines for Multiple Sclerosis",
    "specialty": "Neurology",
    "year": 2024,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Multiple Sclerosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Multiple Sclerosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Multiple+Sclerosis+pdf"
  },
  {
    "id": "gl_49",
    "title": "WHO Guidelines for Parkinson's Disease",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Parkinson's Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Parkinson's Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Parkinson's+Disease+pdf"
  },
  {
    "id": "gl_50",
    "title": "AAP Guidelines for Alzheimer's Disease",
    "specialty": "Neurology",
    "year": 2022,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Alzheimer's Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Alzheimer's Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Alzheimer's+Disease+pdf"
  },
  {
    "id": "gl_51",
    "title": "AGA Guidelines for Myasthenia Gravis",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Myasthenia Gravis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Myasthenia Gravis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Myasthenia+Gravis+pdf"
  },
  {
    "id": "gl_52",
    "title": "NICE Guidelines for Guillain-Barre Syndrome",
    "specialty": "Neurology",
    "year": 2024,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Guillain-Barre Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Guillain-Barre Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+Guillain-Barre+Syndrome+pdf"
  },
  {
    "id": "gl_53",
    "title": "NICE Guidelines for ALS",
    "specialty": "Neurology",
    "year": 2020,
    "organization": "NICE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of ALS.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for ALS.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=NICE+guidelines+ALS+pdf"
  },
  {
    "id": "gl_54",
    "title": "AHA/ACC Guidelines for Peripheral Neuropathy",
    "specialty": "Neurology",
    "year": 2023,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Peripheral Neuropathy.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Peripheral Neuropathy.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Peripheral+Neuropathy+pdf"
  },
  {
    "id": "gl_55",
    "title": "AGA Guidelines for Status Epilepticus",
    "specialty": "Neurology",
    "year": 2020,
    "organization": "AGA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Status Epilepticus.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Status Epilepticus.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA+guidelines+Status+Epilepticus+pdf"
  },
  {
    "id": "gl_56",
    "title": "WHO Guidelines for Subarachnoid Hemorrhage",
    "specialty": "Neurology",
    "year": 2022,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Subarachnoid Hemorrhage.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Subarachnoid Hemorrhage.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Subarachnoid+Hemorrhage+pdf"
  },
  {
    "id": "gl_57",
    "title": "ADA Guidelines for Concussion",
    "specialty": "Neurology",
    "year": 2024,
    "organization": "ADA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Concussion.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Concussion.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA+guidelines+Concussion+pdf"
  },
  {
    "id": "gl_58",
    "title": "IDSA Guidelines for Meningitis",
    "specialty": "Neurology",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Meningitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Meningitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Meningitis+pdf"
  },
  {
    "id": "gl_59",
    "title": "ACOG Guidelines for Encephalitis",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Encephalitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Encephalitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Encephalitis+pdf"
  },
  {
    "id": "gl_60",
    "title": "IDSA Guidelines for Trigeminal Neuralgia",
    "specialty": "Neurology",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Trigeminal Neuralgia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Trigeminal Neuralgia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Trigeminal+Neuralgia+pdf"
  },
  {
    "id": "gl_61",
    "title": "ASCO Guidelines for Restless Legs Syndrome",
    "specialty": "Neurology",
    "year": 2023,
    "organization": "ASCO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Restless Legs Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Restless Legs Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO+guidelines+Restless+Legs+Syndrome+pdf"
  },
  {
    "id": "gl_62",
    "title": "ACOG Guidelines for Essential Tremor",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Essential Tremor.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Essential Tremor.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Essential+Tremor+pdf"
  },
  {
    "id": "gl_63",
    "title": "AHA/ACC Guidelines for Brain Tumors",
    "specialty": "Neurology",
    "year": 2022,
    "organization": "AHA/ACC",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Brain Tumors.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Brain Tumors.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AHA/ACC+guidelines+Brain+Tumors+pdf"
  },
  {
    "id": "gl_64",
    "title": "WHO Guidelines for Tourette Syndrome",
    "specialty": "Neurology",
    "year": 2021,
    "organization": "WHO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Tourette Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Tourette Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=WHO+guidelines+Tourette+Syndrome+pdf"
  },
  {
    "id": "gl_65",
    "title": "KDIGO Guidelines for Huntington's Disease",
    "specialty": "Neurology",
    "year": 2020,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Huntington's Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Huntington's Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Huntington's+Disease+pdf"
  },
  {
    "id": "gl_66",
    "title": "ADA/AACE Guidelines for Type 2 Diabetes",
    "specialty": "Endocrinology",
    "year": 2021,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Type 2 Diabetes.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Type 2 Diabetes.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Type+2+Diabetes+pdf"
  },
  {
    "id": "gl_67",
    "title": "ADA/AACE Guidelines for Type 1 Diabetes",
    "specialty": "Endocrinology",
    "year": 2022,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Type 1 Diabetes.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Type 1 Diabetes.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Type+1+Diabetes+pdf"
  },
  {
    "id": "gl_68",
    "title": "ADA/AACE Guidelines for Hypothyroidism",
    "specialty": "Endocrinology",
    "year": 2024,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypothyroidism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypothyroidism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Hypothyroidism+pdf"
  },
  {
    "id": "gl_69",
    "title": "ADA/AACE Guidelines for Hyperthyroidism",
    "specialty": "Endocrinology",
    "year": 2024,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hyperthyroidism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hyperthyroidism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Hyperthyroidism+pdf"
  },
  {
    "id": "gl_70",
    "title": "ADA/AACE Guidelines for Osteoporosis",
    "specialty": "Endocrinology",
    "year": 2022,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Osteoporosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Osteoporosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Osteoporosis+pdf"
  },
  {
    "id": "gl_71",
    "title": "ADA/AACE Guidelines for PCOS",
    "specialty": "Endocrinology",
    "year": 2022,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of PCOS.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for PCOS.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+PCOS+pdf"
  },
  {
    "id": "gl_72",
    "title": "ADA/AACE Guidelines for Addison's Disease",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Addison's Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Addison's Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Addison's+Disease+pdf"
  },
  {
    "id": "gl_73",
    "title": "ADA/AACE Guidelines for Cushing's Syndrome",
    "specialty": "Endocrinology",
    "year": 2021,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cushing's Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cushing's Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Cushing's+Syndrome+pdf"
  },
  {
    "id": "gl_74",
    "title": "ADA/AACE Guidelines for Hyperparathyroidism",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hyperparathyroidism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hyperparathyroidism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Hyperparathyroidism+pdf"
  },
  {
    "id": "gl_75",
    "title": "ADA/AACE Guidelines for Hypoparathyroidism",
    "specialty": "Endocrinology",
    "year": 2021,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypoparathyroidism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypoparathyroidism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Hypoparathyroidism+pdf"
  },
  {
    "id": "gl_76",
    "title": "ADA/AACE Guidelines for Prolactinoma",
    "specialty": "Endocrinology",
    "year": 2022,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Prolactinoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Prolactinoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Prolactinoma+pdf"
  },
  {
    "id": "gl_77",
    "title": "ADA/AACE Guidelines for Acromegaly",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Acromegaly.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Acromegaly.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Acromegaly+pdf"
  },
  {
    "id": "gl_78",
    "title": "ADA/AACE Guidelines for Diabetes Insipidus",
    "specialty": "Endocrinology",
    "year": 2021,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Diabetes Insipidus.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Diabetes Insipidus.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Diabetes+Insipidus+pdf"
  },
  {
    "id": "gl_79",
    "title": "ADA/AACE Guidelines for Pheochromocytoma",
    "specialty": "Endocrinology",
    "year": 2021,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pheochromocytoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pheochromocytoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Pheochromocytoma+pdf"
  },
  {
    "id": "gl_80",
    "title": "ADA/AACE Guidelines for Primary Aldosteronism",
    "specialty": "Endocrinology",
    "year": 2022,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Primary Aldosteronism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Primary Aldosteronism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Primary+Aldosteronism+pdf"
  },
  {
    "id": "gl_81",
    "title": "ADA/AACE Guidelines for Thyroid Nodules",
    "specialty": "Endocrinology",
    "year": 2024,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Thyroid Nodules.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Thyroid Nodules.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Thyroid+Nodules+pdf"
  },
  {
    "id": "gl_82",
    "title": "ADA/AACE Guidelines for Thyroid Cancer",
    "specialty": "Endocrinology",
    "year": 2024,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Thyroid Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Thyroid Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Thyroid+Cancer+pdf"
  },
  {
    "id": "gl_83",
    "title": "ADA/AACE Guidelines for Congenital Adrenal Hyperplasia",
    "specialty": "Endocrinology",
    "year": 2024,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Congenital Adrenal Hyperplasia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Congenital Adrenal Hyperplasia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Congenital+Adrenal+Hyperplasia+pdf"
  },
  {
    "id": "gl_84",
    "title": "ADA/AACE Guidelines for Obesity Management",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Obesity Management.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Obesity Management.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Obesity+Management+pdf"
  },
  {
    "id": "gl_85",
    "title": "ADA/AACE Guidelines for Male Hypogonadism",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Male Hypogonadism.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Male Hypogonadism.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Male+Hypogonadism+pdf"
  },
  {
    "id": "gl_86",
    "title": "ADA/AACE Guidelines for Turner Syndrome",
    "specialty": "Endocrinology",
    "year": 2020,
    "organization": "ADA/AACE",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Turner Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Turner Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ADA/AACE+guidelines+Turner+Syndrome+pdf"
  },
  {
    "id": "gl_87",
    "title": "AGA/ACG Guidelines for GERD",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of GERD.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for GERD.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+GERD+pdf"
  },
  {
    "id": "gl_88",
    "title": "AGA/ACG Guidelines for Peptic Ulcer Disease",
    "specialty": "Gastroenterology",
    "year": 2021,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Peptic Ulcer Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Peptic Ulcer Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Peptic+Ulcer+Disease+pdf"
  },
  {
    "id": "gl_89",
    "title": "AGA/ACG Guidelines for Crohn's Disease",
    "specialty": "Gastroenterology",
    "year": 2023,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Crohn's Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Crohn's Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Crohn's+Disease+pdf"
  },
  {
    "id": "gl_90",
    "title": "AGA/ACG Guidelines for Ulcerative Colitis",
    "specialty": "Gastroenterology",
    "year": 2021,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ulcerative Colitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ulcerative Colitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Ulcerative+Colitis+pdf"
  },
  {
    "id": "gl_91",
    "title": "AGA/ACG Guidelines for Irritable Bowel Syndrome",
    "specialty": "Gastroenterology",
    "year": 2020,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Irritable Bowel Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Irritable Bowel Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Irritable+Bowel+Syndrome+pdf"
  },
  {
    "id": "gl_92",
    "title": "AGA/ACG Guidelines for Celiac Disease",
    "specialty": "Gastroenterology",
    "year": 2023,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Celiac Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Celiac Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Celiac+Disease+pdf"
  },
  {
    "id": "gl_93",
    "title": "AGA/ACG Guidelines for Hepatitis C",
    "specialty": "Gastroenterology",
    "year": 2021,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hepatitis C.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hepatitis C.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Hepatitis+C+pdf"
  },
  {
    "id": "gl_94",
    "title": "AGA/ACG Guidelines for Hepatitis B",
    "specialty": "Gastroenterology",
    "year": 2020,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hepatitis B.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hepatitis B.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Hepatitis+B+pdf"
  },
  {
    "id": "gl_95",
    "title": "AGA/ACG Guidelines for Cirrhosis",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cirrhosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cirrhosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Cirrhosis+pdf"
  },
  {
    "id": "gl_96",
    "title": "AGA/ACG Guidelines for Acute Pancreatitis",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Acute Pancreatitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Acute Pancreatitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Acute+Pancreatitis+pdf"
  },
  {
    "id": "gl_97",
    "title": "AGA/ACG Guidelines for Chronic Pancreatitis",
    "specialty": "Gastroenterology",
    "year": 2020,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Chronic Pancreatitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Chronic Pancreatitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Chronic+Pancreatitis+pdf"
  },
  {
    "id": "gl_98",
    "title": "AGA/ACG Guidelines for Gallstones",
    "specialty": "Gastroenterology",
    "year": 2023,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gallstones.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gallstones.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Gallstones+pdf"
  },
  {
    "id": "gl_99",
    "title": "AGA/ACG Guidelines for Colorectal Cancer Screening",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Colorectal Cancer Screening.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Colorectal Cancer Screening.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Colorectal+Cancer+Screening+pdf"
  },
  {
    "id": "gl_100",
    "title": "AGA/ACG Guidelines for Barrett's Esophagus",
    "specialty": "Gastroenterology",
    "year": 2023,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Barrett's Esophagus.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Barrett's Esophagus.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Barrett's+Esophagus+pdf"
  },
  {
    "id": "gl_101",
    "title": "AGA/ACG Guidelines for Eosinophilic Esophagitis",
    "specialty": "Gastroenterology",
    "year": 2020,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Eosinophilic Esophagitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Eosinophilic Esophagitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Eosinophilic+Esophagitis+pdf"
  },
  {
    "id": "gl_102",
    "title": "AGA/ACG Guidelines for C. diff Infection",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of C. diff Infection.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for C. diff Infection.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+C.+diff+Infection+pdf"
  },
  {
    "id": "gl_103",
    "title": "AGA/ACG Guidelines for Gastroparesis",
    "specialty": "Gastroenterology",
    "year": 2024,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gastroparesis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gastroparesis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Gastroparesis+pdf"
  },
  {
    "id": "gl_104",
    "title": "AGA/ACG Guidelines for Nonalcoholic Fatty Liver Disease (NAFLD)",
    "specialty": "Gastroenterology",
    "year": 2020,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Nonalcoholic Fatty Liver Disease (NAFLD).",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Nonalcoholic Fatty Liver Disease (NAFLD).",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Nonalcoholic+Fatty+Liver+Disease+(NAFLD)+pdf"
  },
  {
    "id": "gl_105",
    "title": "AGA/ACG Guidelines for Primary Biliary Cholangitis",
    "specialty": "Gastroenterology",
    "year": 2021,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Primary Biliary Cholangitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Primary Biliary Cholangitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Primary+Biliary+Cholangitis+pdf"
  },
  {
    "id": "gl_106",
    "title": "AGA/ACG Guidelines for Hemochromatosis",
    "specialty": "Gastroenterology",
    "year": 2022,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hemochromatosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hemochromatosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Hemochromatosis+pdf"
  },
  {
    "id": "gl_107",
    "title": "AGA/ACG Guidelines for Wilson Disease",
    "specialty": "Gastroenterology",
    "year": 2021,
    "organization": "AGA/ACG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Wilson Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Wilson Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AGA/ACG+guidelines+Wilson+Disease+pdf"
  },
  {
    "id": "gl_108",
    "title": "KDIGO Guidelines for Chronic Kidney Disease",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Chronic Kidney Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Chronic Kidney Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Chronic+Kidney+Disease+pdf"
  },
  {
    "id": "gl_109",
    "title": "KDIGO Guidelines for Acute Kidney Injury",
    "specialty": "Nephrology",
    "year": 2020,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Acute Kidney Injury.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Acute Kidney Injury.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Acute+Kidney+Injury+pdf"
  },
  {
    "id": "gl_110",
    "title": "KDIGO Guidelines for Nephrotic Syndrome",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Nephrotic Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Nephrotic Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Nephrotic+Syndrome+pdf"
  },
  {
    "id": "gl_111",
    "title": "KDIGO Guidelines for Nephritic Syndrome",
    "specialty": "Nephrology",
    "year": 2020,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Nephritic Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Nephritic Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Nephritic+Syndrome+pdf"
  },
  {
    "id": "gl_112",
    "title": "KDIGO Guidelines for IgA Nephropathy",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of IgA Nephropathy.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for IgA Nephropathy.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+IgA+Nephropathy+pdf"
  },
  {
    "id": "gl_113",
    "title": "KDIGO Guidelines for Polycystic Kidney Disease",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Polycystic Kidney Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Polycystic Kidney Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Polycystic+Kidney+Disease+pdf"
  },
  {
    "id": "gl_114",
    "title": "KDIGO Guidelines for Kidney Stones",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Kidney Stones.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Kidney Stones.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Kidney+Stones+pdf"
  },
  {
    "id": "gl_115",
    "title": "KDIGO Guidelines for Hyponatremia",
    "specialty": "Nephrology",
    "year": 2020,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hyponatremia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hyponatremia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Hyponatremia+pdf"
  },
  {
    "id": "gl_116",
    "title": "KDIGO Guidelines for Hyperkalemia",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hyperkalemia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hyperkalemia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Hyperkalemia+pdf"
  },
  {
    "id": "gl_117",
    "title": "KDIGO Guidelines for Metabolic Acidosis",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Metabolic Acidosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Metabolic Acidosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Metabolic+Acidosis+pdf"
  },
  {
    "id": "gl_118",
    "title": "KDIGO Guidelines for Lupus Nephritis",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Lupus Nephritis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Lupus Nephritis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Lupus+Nephritis+pdf"
  },
  {
    "id": "gl_119",
    "title": "KDIGO Guidelines for Goodpasture Syndrome",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Goodpasture Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Goodpasture Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Goodpasture+Syndrome+pdf"
  },
  {
    "id": "gl_120",
    "title": "KDIGO Guidelines for Alport Syndrome",
    "specialty": "Nephrology",
    "year": 2021,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Alport Syndrome.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Alport Syndrome.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Alport+Syndrome+pdf"
  },
  {
    "id": "gl_121",
    "title": "KDIGO Guidelines for Renal Artery Stenosis",
    "specialty": "Nephrology",
    "year": 2023,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Renal Artery Stenosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Renal Artery Stenosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Renal+Artery+Stenosis+pdf"
  },
  {
    "id": "gl_122",
    "title": "KDIGO Guidelines for Renal Cell Carcinoma",
    "specialty": "Nephrology",
    "year": 2020,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Renal Cell Carcinoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Renal Cell Carcinoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Renal+Cell+Carcinoma+pdf"
  },
  {
    "id": "gl_123",
    "title": "KDIGO Guidelines for Dialysis Initiation",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Dialysis Initiation.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Dialysis Initiation.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Dialysis+Initiation+pdf"
  },
  {
    "id": "gl_124",
    "title": "KDIGO Guidelines for Kidney Transplant Protocol",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Kidney Transplant Protocol.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Kidney Transplant Protocol.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Kidney+Transplant+Protocol+pdf"
  },
  {
    "id": "gl_125",
    "title": "KDIGO Guidelines for Hypokalemia",
    "specialty": "Nephrology",
    "year": 2022,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypokalemia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypokalemia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Hypokalemia+pdf"
  },
  {
    "id": "gl_126",
    "title": "KDIGO Guidelines for Hypercalcemia",
    "specialty": "Nephrology",
    "year": 2023,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hypercalcemia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hypercalcemia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Hypercalcemia+pdf"
  },
  {
    "id": "gl_127",
    "title": "KDIGO Guidelines for Diabetes Insipidus",
    "specialty": "Nephrology",
    "year": 2024,
    "organization": "KDIGO",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Diabetes Insipidus.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Diabetes Insipidus.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=KDIGO+guidelines+Diabetes+Insipidus+pdf"
  },
  {
    "id": "gl_128",
    "title": "ASCO/NCCN Guidelines for Breast Cancer",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Breast Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Breast Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Breast+Cancer+pdf"
  },
  {
    "id": "gl_129",
    "title": "ASCO/NCCN Guidelines for Lung Cancer",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Lung Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Lung Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Lung+Cancer+pdf"
  },
  {
    "id": "gl_130",
    "title": "ASCO/NCCN Guidelines for Colorectal Cancer",
    "specialty": "Oncology",
    "year": 2024,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Colorectal Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Colorectal Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Colorectal+Cancer+pdf"
  },
  {
    "id": "gl_131",
    "title": "ASCO/NCCN Guidelines for Prostate Cancer",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Prostate Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Prostate Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Prostate+Cancer+pdf"
  },
  {
    "id": "gl_132",
    "title": "ASCO/NCCN Guidelines for Melanoma",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Melanoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Melanoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Melanoma+pdf"
  },
  {
    "id": "gl_133",
    "title": "ASCO/NCCN Guidelines for Pancreatic Cancer",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pancreatic Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pancreatic Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Pancreatic+Cancer+pdf"
  },
  {
    "id": "gl_134",
    "title": "ASCO/NCCN Guidelines for Ovarian Cancer",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ovarian Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ovarian Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Ovarian+Cancer+pdf"
  },
  {
    "id": "gl_135",
    "title": "ASCO/NCCN Guidelines for Cervical Cancer",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cervical Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cervical Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Cervical+Cancer+pdf"
  },
  {
    "id": "gl_136",
    "title": "ASCO/NCCN Guidelines for Hodgkin Lymphoma",
    "specialty": "Oncology",
    "year": 2023,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hodgkin Lymphoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hodgkin Lymphoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Hodgkin+Lymphoma+pdf"
  },
  {
    "id": "gl_137",
    "title": "ASCO/NCCN Guidelines for Non-Hodgkin Lymphoma",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Non-Hodgkin Lymphoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Non-Hodgkin Lymphoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Non-Hodgkin+Lymphoma+pdf"
  },
  {
    "id": "gl_138",
    "title": "ASCO/NCCN Guidelines for Multiple Myeloma",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Multiple Myeloma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Multiple Myeloma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Multiple+Myeloma+pdf"
  },
  {
    "id": "gl_139",
    "title": "ASCO/NCCN Guidelines for CML",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of CML.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for CML.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+CML+pdf"
  },
  {
    "id": "gl_140",
    "title": "ASCO/NCCN Guidelines for CLL",
    "specialty": "Oncology",
    "year": 2023,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of CLL.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for CLL.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+CLL+pdf"
  },
  {
    "id": "gl_141",
    "title": "ASCO/NCCN Guidelines for AML",
    "specialty": "Oncology",
    "year": 2023,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of AML.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for AML.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+AML+pdf"
  },
  {
    "id": "gl_142",
    "title": "ASCO/NCCN Guidelines for ALL",
    "specialty": "Oncology",
    "year": 2024,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of ALL.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for ALL.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+ALL+pdf"
  },
  {
    "id": "gl_143",
    "title": "ASCO/NCCN Guidelines for Testicular Cancer",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Testicular Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Testicular Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Testicular+Cancer+pdf"
  },
  {
    "id": "gl_144",
    "title": "ASCO/NCCN Guidelines for Thyroid Cancer",
    "specialty": "Oncology",
    "year": 2020,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Thyroid Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Thyroid Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Thyroid+Cancer+pdf"
  },
  {
    "id": "gl_145",
    "title": "ASCO/NCCN Guidelines for Gastric Cancer",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gastric Cancer.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gastric Cancer.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Gastric+Cancer+pdf"
  },
  {
    "id": "gl_146",
    "title": "ASCO/NCCN Guidelines for Hepatocellular Carcinoma",
    "specialty": "Oncology",
    "year": 2023,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hepatocellular Carcinoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hepatocellular Carcinoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Hepatocellular+Carcinoma+pdf"
  },
  {
    "id": "gl_147",
    "title": "ASCO/NCCN Guidelines for Renal Cell Carcinoma",
    "specialty": "Oncology",
    "year": 2024,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Renal Cell Carcinoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Renal Cell Carcinoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Renal+Cell+Carcinoma+pdf"
  },
  {
    "id": "gl_148",
    "title": "ASCO/NCCN Guidelines for Sarcoma",
    "specialty": "Oncology",
    "year": 2022,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sarcoma.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sarcoma.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Sarcoma+pdf"
  },
  {
    "id": "gl_149",
    "title": "ASCO/NCCN Guidelines for Brain Tumors",
    "specialty": "Oncology",
    "year": 2023,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Brain Tumors.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Brain Tumors.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Brain+Tumors+pdf"
  },
  {
    "id": "gl_150",
    "title": "ASCO/NCCN Guidelines for Palliative Care",
    "specialty": "Oncology",
    "year": 2021,
    "organization": "ASCO/NCCN",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Palliative Care.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Palliative Care.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ASCO/NCCN+guidelines+Palliative+Care+pdf"
  },
  {
    "id": "gl_151",
    "title": "AAP Guidelines for Asthma in Children",
    "specialty": "Pediatrics",
    "year": 2021,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Asthma in Children.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Asthma in Children.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Asthma+in+Children+pdf"
  },
  {
    "id": "gl_152",
    "title": "AAP Guidelines for Otitis Media",
    "specialty": "Pediatrics",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Otitis Media.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Otitis Media.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Otitis+Media+pdf"
  },
  {
    "id": "gl_153",
    "title": "AAP Guidelines for ADHD",
    "specialty": "Pediatrics",
    "year": 2022,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of ADHD.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for ADHD.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+ADHD+pdf"
  },
  {
    "id": "gl_154",
    "title": "AAP Guidelines for Autism Spectrum Disorder",
    "specialty": "Pediatrics",
    "year": 2021,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Autism Spectrum Disorder.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Autism Spectrum Disorder.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Autism+Spectrum+Disorder+pdf"
  },
  {
    "id": "gl_155",
    "title": "AAP Guidelines for Febrile Seizures",
    "specialty": "Pediatrics",
    "year": 2022,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Febrile Seizures.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Febrile Seizures.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Febrile+Seizures+pdf"
  },
  {
    "id": "gl_156",
    "title": "AAP Guidelines for UTI in Children",
    "specialty": "Pediatrics",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of UTI in Children.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for UTI in Children.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+UTI+in+Children+pdf"
  },
  {
    "id": "gl_157",
    "title": "AAP Guidelines for Croup",
    "specialty": "Pediatrics",
    "year": 2024,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Croup.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Croup.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Croup+pdf"
  },
  {
    "id": "gl_158",
    "title": "AAP Guidelines for Bronchiolitis",
    "specialty": "Pediatrics",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Bronchiolitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Bronchiolitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Bronchiolitis+pdf"
  },
  {
    "id": "gl_159",
    "title": "AAP Guidelines for Gastroenteritis",
    "specialty": "Pediatrics",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gastroenteritis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gastroenteritis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Gastroenteritis+pdf"
  },
  {
    "id": "gl_160",
    "title": "AAP Guidelines for Childhood Obesity",
    "specialty": "Pediatrics",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Childhood Obesity.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Childhood Obesity.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Childhood+Obesity+pdf"
  },
  {
    "id": "gl_161",
    "title": "AAP Guidelines for Type 1 Diabetes",
    "specialty": "Pediatrics",
    "year": 2021,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Type 1 Diabetes.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Type 1 Diabetes.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Type+1+Diabetes+pdf"
  },
  {
    "id": "gl_162",
    "title": "AAP Guidelines for Celiac Disease in Children",
    "specialty": "Pediatrics",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Celiac Disease in Children.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Celiac Disease in Children.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Celiac+Disease+in+Children+pdf"
  },
  {
    "id": "gl_163",
    "title": "AAP Guidelines for Neonatal Jaundice",
    "specialty": "Pediatrics",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Neonatal Jaundice.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Neonatal Jaundice.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Neonatal+Jaundice+pdf"
  },
  {
    "id": "gl_164",
    "title": "AAP Guidelines for Sepsis in Neonates",
    "specialty": "Pediatrics",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sepsis in Neonates.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sepsis in Neonates.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Sepsis+in+Neonates+pdf"
  },
  {
    "id": "gl_165",
    "title": "AAP Guidelines for Congenital Heart Defects",
    "specialty": "Pediatrics",
    "year": 2020,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Congenital Heart Defects.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Congenital Heart Defects.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Congenital+Heart+Defects+pdf"
  },
  {
    "id": "gl_166",
    "title": "AAP Guidelines for Cystic Fibrosis",
    "specialty": "Pediatrics",
    "year": 2022,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cystic Fibrosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cystic Fibrosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Cystic+Fibrosis+pdf"
  },
  {
    "id": "gl_167",
    "title": "AAP Guidelines for Sickle Cell Disease",
    "specialty": "Pediatrics",
    "year": 2024,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sickle Cell Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sickle Cell Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Sickle+Cell+Disease+pdf"
  },
  {
    "id": "gl_168",
    "title": "AAP Guidelines for Lead Poisoning",
    "specialty": "Pediatrics",
    "year": 2024,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Lead Poisoning.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Lead Poisoning.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Lead+Poisoning+pdf"
  },
  {
    "id": "gl_169",
    "title": "AAP Guidelines for Immunization Schedule",
    "specialty": "Pediatrics",
    "year": 2023,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Immunization Schedule.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Immunization Schedule.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Immunization+Schedule+pdf"
  },
  {
    "id": "gl_170",
    "title": "AAP Guidelines for Child Abuse Recognition",
    "specialty": "Pediatrics",
    "year": 2022,
    "organization": "AAP",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Child Abuse Recognition.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Child Abuse Recognition.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=AAP+guidelines+Child+Abuse+Recognition+pdf"
  },
  {
    "id": "gl_171",
    "title": "ACOG Guidelines for Prenatal Care",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Prenatal Care.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Prenatal Care.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Prenatal+Care+pdf"
  },
  {
    "id": "gl_172",
    "title": "ACOG Guidelines for Gestational Diabetes",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gestational Diabetes.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gestational Diabetes.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Gestational+Diabetes+pdf"
  },
  {
    "id": "gl_173",
    "title": "ACOG Guidelines for Preeclampsia",
    "specialty": "Obstetrics/Gynecology",
    "year": 2024,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Preeclampsia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Preeclampsia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Preeclampsia+pdf"
  },
  {
    "id": "gl_174",
    "title": "ACOG Guidelines for Ectopic Pregnancy",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ectopic Pregnancy.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ectopic Pregnancy.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Ectopic+Pregnancy+pdf"
  },
  {
    "id": "gl_175",
    "title": "ACOG Guidelines for Endometriosis",
    "specialty": "Obstetrics/Gynecology",
    "year": 2023,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Endometriosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Endometriosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Endometriosis+pdf"
  },
  {
    "id": "gl_176",
    "title": "ACOG Guidelines for PCOS",
    "specialty": "Obstetrics/Gynecology",
    "year": 2023,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of PCOS.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for PCOS.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+PCOS+pdf"
  },
  {
    "id": "gl_177",
    "title": "ACOG Guidelines for Cervical Cancer Screening",
    "specialty": "Obstetrics/Gynecology",
    "year": 2023,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cervical Cancer Screening.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cervical Cancer Screening.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Cervical+Cancer+Screening+pdf"
  },
  {
    "id": "gl_178",
    "title": "ACOG Guidelines for Breast Cancer Screening",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Breast Cancer Screening.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Breast Cancer Screening.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Breast+Cancer+Screening+pdf"
  },
  {
    "id": "gl_179",
    "title": "ACOG Guidelines for Menopause Management",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Menopause Management.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Menopause Management.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Menopause+Management+pdf"
  },
  {
    "id": "gl_180",
    "title": "ACOG Guidelines for Pelvic Inflammatory Disease",
    "specialty": "Obstetrics/Gynecology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Pelvic Inflammatory Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Pelvic Inflammatory Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Pelvic+Inflammatory+Disease+pdf"
  },
  {
    "id": "gl_181",
    "title": "ACOG Guidelines for Uterine Fibroids",
    "specialty": "Obstetrics/Gynecology",
    "year": 2024,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Uterine Fibroids.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Uterine Fibroids.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Uterine+Fibroids+pdf"
  },
  {
    "id": "gl_182",
    "title": "ACOG Guidelines for Ovarian Cysts",
    "specialty": "Obstetrics/Gynecology",
    "year": 2023,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Ovarian Cysts.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Ovarian Cysts.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Ovarian+Cysts+pdf"
  },
  {
    "id": "gl_183",
    "title": "ACOG Guidelines for Contraception",
    "specialty": "Obstetrics/Gynecology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Contraception.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Contraception.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Contraception+pdf"
  },
  {
    "id": "gl_184",
    "title": "ACOG Guidelines for Infertility",
    "specialty": "Obstetrics/Gynecology",
    "year": 2024,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Infertility.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Infertility.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Infertility+pdf"
  },
  {
    "id": "gl_185",
    "title": "ACOG Guidelines for Vaginitis",
    "specialty": "Obstetrics/Gynecology",
    "year": 2021,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Vaginitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Vaginitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Vaginitis+pdf"
  },
  {
    "id": "gl_186",
    "title": "ACOG Guidelines for Postpartum Depression",
    "specialty": "Obstetrics/Gynecology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Postpartum Depression.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Postpartum Depression.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Postpartum+Depression+pdf"
  },
  {
    "id": "gl_187",
    "title": "ACOG Guidelines for Placenta Previa",
    "specialty": "Obstetrics/Gynecology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Placenta Previa.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Placenta Previa.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Placenta+Previa+pdf"
  },
  {
    "id": "gl_188",
    "title": "ACOG Guidelines for Placental Abruption",
    "specialty": "Obstetrics/Gynecology",
    "year": 2022,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Placental Abruption.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Placental Abruption.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Placental+Abruption+pdf"
  },
  {
    "id": "gl_189",
    "title": "ACOG Guidelines for Preterm Labor",
    "specialty": "Obstetrics/Gynecology",
    "year": 2023,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Preterm Labor.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Preterm Labor.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Preterm+Labor+pdf"
  },
  {
    "id": "gl_190",
    "title": "ACOG Guidelines for Rh Incompatibility",
    "specialty": "Obstetrics/Gynecology",
    "year": 2024,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Rh Incompatibility.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Rh Incompatibility.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Rh+Incompatibility+pdf"
  },
  {
    "id": "gl_191",
    "title": "ACOG Guidelines for Gestational Hypertension",
    "specialty": "Obstetrics/Gynecology",
    "year": 2024,
    "organization": "ACOG",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gestational Hypertension.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gestational Hypertension.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=ACOG+guidelines+Gestational+Hypertension+pdf"
  },
  {
    "id": "gl_192",
    "title": "IDSA Guidelines for Sepsis",
    "specialty": "Infectious Diseases",
    "year": 2021,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Sepsis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Sepsis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Sepsis+pdf"
  },
  {
    "id": "gl_193",
    "title": "IDSA Guidelines for HIV/AIDS",
    "specialty": "Infectious Diseases",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of HIV/AIDS.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for HIV/AIDS.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+HIV/AIDS+pdf"
  },
  {
    "id": "gl_194",
    "title": "IDSA Guidelines for Tuberculosis",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Tuberculosis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Tuberculosis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Tuberculosis+pdf"
  },
  {
    "id": "gl_195",
    "title": "IDSA Guidelines for COVID-19",
    "specialty": "Infectious Diseases",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of COVID-19.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for COVID-19.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+COVID-19+pdf"
  },
  {
    "id": "gl_196",
    "title": "IDSA Guidelines for Influenza",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Influenza.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Influenza.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Influenza+pdf"
  },
  {
    "id": "gl_197",
    "title": "IDSA Guidelines for Community-Acquired Pneumonia",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Community-Acquired Pneumonia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Community-Acquired Pneumonia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Community-Acquired+Pneumonia+pdf"
  },
  {
    "id": "gl_198",
    "title": "IDSA Guidelines for Urinary Tract Infections",
    "specialty": "Infectious Diseases",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Urinary Tract Infections.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Urinary Tract Infections.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Urinary+Tract+Infections+pdf"
  },
  {
    "id": "gl_199",
    "title": "IDSA Guidelines for Cellulitis",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Cellulitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Cellulitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Cellulitis+pdf"
  },
  {
    "id": "gl_200",
    "title": "IDSA Guidelines for Osteomyelitis",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Osteomyelitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Osteomyelitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Osteomyelitis+pdf"
  },
  {
    "id": "gl_201",
    "title": "IDSA Guidelines for Endocarditis",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Endocarditis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Endocarditis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Endocarditis+pdf"
  },
  {
    "id": "gl_202",
    "title": "IDSA Guidelines for Meningitis",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Meningitis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Meningitis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Meningitis+pdf"
  },
  {
    "id": "gl_203",
    "title": "IDSA Guidelines for Lyme Disease",
    "specialty": "Infectious Diseases",
    "year": 2021,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Lyme Disease.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Lyme Disease.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Lyme+Disease+pdf"
  },
  {
    "id": "gl_204",
    "title": "IDSA Guidelines for Syphilis",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Syphilis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Syphilis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Syphilis+pdf"
  },
  {
    "id": "gl_205",
    "title": "IDSA Guidelines for Gonorrhea",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Gonorrhea.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Gonorrhea.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Gonorrhea+pdf"
  },
  {
    "id": "gl_206",
    "title": "IDSA Guidelines for Chlamydia",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Chlamydia.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Chlamydia.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Chlamydia+pdf"
  },
  {
    "id": "gl_207",
    "title": "IDSA Guidelines for Herpes Simplex",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Herpes Simplex.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Herpes Simplex.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Herpes+Simplex+pdf"
  },
  {
    "id": "gl_208",
    "title": "IDSA Guidelines for Malaria",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Malaria.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Malaria.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Malaria+pdf"
  },
  {
    "id": "gl_209",
    "title": "IDSA Guidelines for C. diff Infection",
    "specialty": "Infectious Diseases",
    "year": 2023,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of C. diff Infection.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for C. diff Infection.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+C.+diff+Infection+pdf"
  },
  {
    "id": "gl_210",
    "title": "IDSA Guidelines for MRSA Infections",
    "specialty": "Infectious Diseases",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of MRSA Infections.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for MRSA Infections.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+MRSA+Infections+pdf"
  },
  {
    "id": "gl_211",
    "title": "IDSA Guidelines for Hepatitis C",
    "specialty": "Infectious Diseases",
    "year": 2022,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hepatitis C.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hepatitis C.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Hepatitis+C+pdf"
  },
  {
    "id": "gl_212",
    "title": "IDSA Guidelines for Hepatitis B",
    "specialty": "Infectious Diseases",
    "year": 2020,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Hepatitis B.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Hepatitis B.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Hepatitis+B+pdf"
  },
  {
    "id": "gl_213",
    "title": "IDSA Guidelines for Rabies Prophylaxis",
    "specialty": "Infectious Diseases",
    "year": 2024,
    "organization": "IDSA",
    "description": "Comprehensive evidence-based recommendations for the diagnosis, management, and treatment of Rabies Prophylaxis.",
    "keyPoints": [
      "First-line therapy recommendations and dosage adjustments for Rabies Prophylaxis.",
      "Diagnostic criteria and required laboratory/imaging investigations.",
      "Risk stratification and prognosis evaluation.",
      "When to refer to a specialist and surgical indications."
    ],
    "pdfUrl": "https://www.google.com/search?q=IDSA+guidelines+Rabies+Prophylaxis+pdf"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const specialty = searchParams.get('specialty') || '';

  let filtered = guidelines;

  if (search) {
    filtered = filtered.filter(g => 
      g.title.toLowerCase().includes(search) || 
      g.description.toLowerCase().includes(search) ||
      g.keyPoints.some(kp => kp.toLowerCase().includes(search))
    );
  }

  if (specialty && specialty !== 'All Specialties') {
    filtered = filtered.filter(g => g.specialty === specialty);
  }

  return NextResponse.json(filtered);
}
