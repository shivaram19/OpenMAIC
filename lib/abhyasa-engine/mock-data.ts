import type {
  DemoStudent,
  VaultQuestion,
  ExamResult,
  Subject,
  Difficulty,
  ResponseCorrect,
} from './types';

const maleNames = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Vihaan',
  'Arjun',
  'Sai',
  'Ayaan',
  'Krishna',
  'Ishaan',
  'Rohan',
  'Ansh',
  'Aryan',
  'Darsh',
  'Kunal',
  'Manav',
  'Nikhil',
  'Om',
  'Pranav',
  'Rahul',
  'Siddharth',
];
const femaleNames = [
  'Aadhya',
  'Ananya',
  'Diya',
  'Ira',
  'Kavya',
  'Myra',
  'Navya',
  'Pari',
  'Saanvi',
  'Sara',
  'Aarohi',
  'Ishani',
  'Jhanvi',
  'Kiara',
  'Meera',
  'Nehal',
  'Riya',
  'Siya',
  'Tara',
  'Yashvi',
];
const surnames = [
  'Sharma',
  'Patel',
  'Reddy',
  'Gupta',
  'Nair',
  'Kumar',
  'Singh',
  'Mehta',
  'Iyer',
  'Desai',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function createMockStudents(count = 30): DemoStudent[] {
  const students: DemoStudent[] = [];
  const names = shuffle([
    ...maleNames.slice(0, count / 2),
    ...femaleNames.slice(0, count / 2),
  ]).slice(0, count);
  for (let i = 0; i < count; i++) {
    const grade = pick(['8', '9', '10']);
    const cls = pick(['A', 'B', 'C']);
    students.push({
      id: `stu_${i + 1}`,
      name: `${names[i]} ${pick(surnames)}`,
      grade,
      class: `${grade}${cls}`,
      school: 'MSR Kidz High School',
    });
  }
  return students.sort((a, b) => a.name.localeCompare(b.name));
}

function mcq(
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
  misconceptionTag?: string,
) {
  return {
    question,
    options: options.map((label, i) => ({ label, value: String.fromCharCode(65 + i) })),
    answer: [String.fromCharCode(65 + answerIndex)],
    explanation,
    misconceptionTag,
  };
}

function shortAnswer(
  question: string,
  answer: string[],
  explanation: string,
  misconceptionTag?: string,
) {
  return { question, options: undefined, answer, explanation, misconceptionTag };
}

export function createMockVault(): VaultQuestion[] {
  const vault: VaultQuestion[] = [];
  let idCounter = 1;

  const add = (
    subject: Subject,
    topic: string,
    subTopic: string,
    difficulty: Difficulty,
    q: ReturnType<typeof mcq> | ReturnType<typeof shortAnswer>,
  ) => {
    vault.push({
      id: `q_${String(idCounter++).padStart(3, '0')}`,
      subject,
      topic,
      subTopic,
      difficulty,
      type: 'options' in q && q.options ? 'single' : 'short_answer',
      ...q,
      estimatedTimeMin: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6,
    });
  };

  // Maths
  add(
    'maths',
    'Linear Equations',
    'One-variable',
    'easy',
    mcq(
      'Solve: 2x + 5 = 13',
      ['x = 3', 'x = 4', 'x = 5', 'x = 9'],
      1,
      'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4.',
      'sign_error',
    ),
  );
  add(
    'maths',
    'Linear Equations',
    'One-variable',
    'medium',
    mcq(
      'Solve: 3(x - 2) = 2(x + 1)',
      ['x = 8', 'x = 6', 'x = 4', 'x = -4'],
      0,
      'Expand: 3x - 6 = 2x + 2. Bring like terms together: x = 8.',
      'distribution_error',
    ),
  );
  add(
    'maths',
    'Linear Equations',
    'Word problems',
    'hard',
    shortAnswer(
      'The sum of three consecutive even numbers is 66. Find the numbers.',
      ['20, 22, 24'],
      'Let the numbers be x, x+2, x+4. Then 3x + 6 = 66, so x = 20.',
      'variable_setup',
    ),
  );
  add(
    'maths',
    'Quadratics',
    'Factoring',
    'easy',
    mcq(
      'Factor: x² - 5x + 6',
      ['(x-1)(x-6)', '(x-2)(x-3)', '(x+2)(x+3)', '(x-5)(x+1)'],
      1,
      'Find two numbers that multiply to 6 and add to -5: -2 and -3.',
      'factor_signs',
    ),
  );
  add(
    'maths',
    'Quadratics',
    'Formula',
    'medium',
    mcq(
      'For x² - 6x + 7 = 0, the discriminant is:',
      ['8', '36', '-8', '64'],
      0,
      'Discriminant = b² - 4ac = 36 - 28 = 8.',
      'discriminant_error',
    ),
  );
  add(
    'maths',
    'Quadratics',
    'Roots',
    'hard',
    shortAnswer(
      'If α and β are roots of x² - 7x + 10 = 0, find α² + β².',
      ['29'],
      'α + β = 7, αβ = 10. α² + β² = (α+β)² - 2αβ = 49 - 20 = 29.',
      'root_relation',
    ),
  );
  add(
    'maths',
    'Triangles',
    'Pythagoras',
    'easy',
    mcq(
      'A right triangle has legs 6 cm and 8 cm. The hypotenuse is:',
      ['10 cm', '12 cm', '14 cm', '100 cm'],
      0,
      'c² = 6² + 8² = 36 + 64 = 100, so c = 10.',
      'square_root',
    ),
  );
  add(
    'maths',
    'Triangles',
    'Similarity',
    'medium',
    shortAnswer(
      'Two similar triangles have corresponding sides 3 cm and 5 cm. If the smaller perimeter is 18 cm, find the larger.',
      ['30 cm'],
      'Ratio = 5/3. Larger perimeter = 18 × (5/3) = 30 cm.',
      'ratio_error',
    ),
  );
  add(
    'maths',
    'Triangles',
    'Congruence',
    'hard',
    mcq(
      'Which congruence rule proves two right triangles congruent if their hypotenuse and one side are equal?',
      ['SAS', 'ASA', 'RHS', 'SSS'],
      2,
      'Right angle - Hypotenuse - Side is the RHS congruence criterion.',
      'congruence_rule',
    ),
  );

  // Physics
  add(
    'physics',
    'Force and Motion',
    'Newton laws',
    'easy',
    mcq(
      'Newton’s first law is also called the law of:',
      ['Acceleration', 'Inertia', 'Momentum', 'Gravitation'],
      1,
      'First law states that objects resist changes in motion; this property is inertia.',
      'definition_confusion',
    ),
  );
  add(
    'physics',
    'Force and Motion',
    'Newton laws',
    'medium',
    mcq(
      'A 5 kg object accelerates at 2 m/s². The net force is:',
      ['10 N', '7 N', '2.5 N', '20 N'],
      0,
      'F = ma = 5 × 2 = 10 N.',
      'formula_mixup',
    ),
  );
  add(
    'physics',
    'Force and Motion',
    'Momentum',
    'hard',
    shortAnswer(
      'A 2 kg ball moving at 6 m/s collides with a wall and rebounds at 4 m/s. Find the change in momentum.',
      ['20 kg·m/s'],
      'Δp = m(v - u) = 2(4 - (-6)) = 2 × 10 = 20 kg·m/s. Note the sign change.',
      'sign_change',
    ),
  );
  add(
    'physics',
    'Light',
    'Reflection',
    'easy',
    mcq(
      'The angle of incidence equals the angle of:',
      ['Refraction', 'Reflection', 'Deviation', 'Depression'],
      1,
      'Law of reflection: angle of incidence = angle of reflection.',
      'law_confusion',
    ),
  );
  add(
    'physics',
    'Light',
    'Refraction',
    'medium',
    mcq(
      'Light travels from air to glass. It bends:',
      ['Towards the normal', 'Away from the normal', 'Does not bend', 'Perpendicular'],
      0,
      'Glass is optically denser; light slows down and bends towards the normal.',
      'medium_density',
    ),
  );
  add(
    'physics',
    'Light',
    'Lenses',
    'hard',
    shortAnswer(
      'An object is placed 15 cm from a convex lens of focal length 10 cm. Find the image distance.',
      ['30 cm'],
      'Use 1/f = 1/v - 1/u. 1/10 = 1/v - 1/(-15). So 1/v = 1/10 - 1/15 = 1/30, v = 30 cm.',
      'lens_formula_sign',
    ),
  );
  add(
    'physics',
    'Electricity',
    'Ohm law',
    'easy',
    mcq(
      'If V = 12 V and R = 4 Ω, the current is:',
      ['3 A', '48 A', '0.33 A', '8 A'],
      0,
      'I = V/R = 12/4 = 3 A.',
      'ohms_law',
    ),
  );
  add(
    'physics',
    'Electricity',
    'Series circuits',
    'medium',
    mcq(
      'Two resistors 4 Ω and 6 Ω are connected in series. Total resistance is:',
      ['2.4 Ω', '10 Ω', '24 Ω', '1.5 Ω'],
      1,
      'In series, R_total = R1 + R2 = 4 + 6 = 10 Ω.',
      'series_parallel_confusion',
    ),
  );
  add(
    'physics',
    'Electricity',
    'Parallel circuits',
    'hard',
    shortAnswer(
      'Two resistors 6 Ω and 12 Ω are connected in parallel across a 12 V battery. Find total current.',
      ['3 A'],
      '1/R = 1/6 + 1/12 = 1/4, so R = 4 Ω. I = V/R = 12/4 = 3 A.',
      'parallel_reciprocal',
    ),
  );

  // Chemistry
  add(
    'chemistry',
    'Acids Bases Salts',
    'pH',
    'easy',
    mcq(
      'A solution with pH 3 is:',
      ['Strongly alkaline', 'Neutral', 'Acidic', 'Basic'],
      2,
      'pH < 7 is acidic, pH = 7 neutral, pH > 7 basic.',
      'ph_scale',
    ),
  );
  add(
    'chemistry',
    'Acids Bases Salts',
    'Neutralization',
    'medium',
    shortAnswer(
      'Write the balanced equation for HCl + NaOH.',
      ['HCl + NaOH → NaCl + H₂O'],
      'Acid + base → salt + water.',
      'balancing',
    ),
  );
  add(
    'chemistry',
    'Acids Bases Salts',
    'Indicators',
    'hard',
    mcq(
      'Which indicator turns colourless in acidic and pink in basic medium?',
      ['Methyl orange', 'Phenolphthalein', 'Litmus', 'Turmeric'],
      1,
      'Phenolphthalein is colourless in acid and pink in base.',
      'indicator_memory',
    ),
  );
  add(
    'chemistry',
    'Periodic Table',
    'Groups',
    'easy',
    mcq(
      'Elements in the same group have the same number of:',
      ['Neutrons', 'Valence electrons', 'Protons', 'Shells'],
      1,
      'Group number indicates valence electrons for main-group elements.',
      'group_period_confusion',
    ),
  );
  add(
    'chemistry',
    'Periodic Table',
    'Periods',
    'medium',
    mcq(
      'The period number tells us the number of:',
      ['Valence electrons', 'Electron shells', 'Protons', 'Neutrons'],
      1,
      'Period number equals the number of occupied electron shells.',
      'shell_confusion',
    ),
  );
  add(
    'chemistry',
    'Periodic Table',
    'Trends',
    'hard',
    shortAnswer(
      'Arrange Li, Na, K in increasing order of metallic character.',
      ['Li < Na < K'],
      'Metallic character increases down a group as atomic size increases.',
      'trend_direction',
    ),
  );
  add(
    'chemistry',
    'Chemical Reactions',
    'Balancing',
    'easy',
    mcq(
      'The balanced form of H₂ + O₂ → H₂O is:',
      ['H₂ + O₂ → H₂O', '2H₂ + O₂ → 2H₂O', 'H₂ + 2O₂ → 2H₂O', 'H₂ + O₂ → 2H₂O'],
      1,
      'Balance atoms: 2 H₂ + O₂ → 2 H₂O has 4 H and 2 O on both sides.',
      'balancing',
    ),
  );
  add(
    'chemistry',
    'Chemical Reactions',
    'Types',
    'medium',
    mcq(
      'A reaction in which one element replaces another in a compound is called:',
      ['Combination', 'Displacement', 'Decomposition', 'Double displacement'],
      1,
      'A + BC → AC + B is a single displacement reaction.',
      'reaction_type',
    ),
  );
  add(
    'chemistry',
    'Chemical Reactions',
    'Equations',
    'hard',
    shortAnswer(
      'Identify the type: 2KClO₃ → 2KCl + 3O₂',
      ['Decomposition'],
      'A single compound breaks down into simpler substances.',
      'reaction_type',
    ),
  );

  return vault;
}

export function createMockExamResults(
  students: DemoStudent[],
  vault: VaultQuestion[],
): ExamResult[] {
  return students.map((student) => {
    const responses = vault.map((q) => {
      // Bias: easier questions more likely correct; harder questions more likely wrong.
      const base = q.difficulty === 'easy' ? 0.75 : q.difficulty === 'medium' ? 0.55 : 0.35;
      // Add some student-level noise.
      const noise = (Math.random() - 0.5) * 0.3;
      const p = Math.max(0.1, Math.min(0.95, base + noise));
      const roll = Math.random();
      let correct: ResponseCorrect;
      if (roll < p - 0.15) correct = 'right';
      else if (roll < p) correct = 'partial';
      else correct = 'wrong';
      return {
        questionId: q.id,
        correct,
        timeSpentSec: Math.round(q.estimatedTimeMin * 60 * (0.7 + Math.random() * 0.6)),
      };
    });
    return {
      studentId: student.id,
      examName: 'Mid-Term Diagnostic - June 2026',
      date: '2026-06-15',
      responses,
    };
  });
}

export function createInitialDemoState() {
  const students = createMockStudents(30);
  const vault = createMockVault();
  const examResults = createMockExamResults(students, vault);
  return {
    students,
    vault,
    examResults,
    assignedSets: [],
    seededAt: new Date().toISOString(),
  };
}

export const DEMO_STORAGE_KEY = 'abhyasa-demo-state-v1';
