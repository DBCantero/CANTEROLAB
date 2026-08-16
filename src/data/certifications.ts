export type Certification = {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  description: string;
};

// As credenciais reais entram aqui quando estiverem prontas para publicação.
export const certifications: Certification[] = [];
