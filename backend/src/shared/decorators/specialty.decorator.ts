import { SetMetadata } from '@nestjs/common';
import { SpecialtyRequirement, SPECIALTY_KEY } from '../guards/specialty.guard';

export const RequireSpecialty = (specialty: SpecialtyRequirement['specialty'], roles: SpecialtyRequirement['roles']) =>
  SetMetadata(SPECIALTY_KEY, [{ specialty, roles }]);
