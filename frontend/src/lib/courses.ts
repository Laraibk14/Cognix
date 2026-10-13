export type Course = {
  id: string;
  name: string;
  program: string;
  semester: number;
};

export const courses: Course[] = [
  ...Array.from({ length: 4 }, (_, index) => ({
    id: `mca_sem_${index + 1}`,
    name: `MCA Sem ${index + 1}`,
    program: "MCA",
    semester: index + 1,
  })),
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `bca_sem_${index + 1}`,
    name: `BCA Sem ${index + 1}`,
    program: "BCA",
    semester: index + 1,
  })),
];
