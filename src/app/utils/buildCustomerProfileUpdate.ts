export type CustomerProfileUpdate = {
  name?: string;
  phoneNumber?: string | null;
  notes?: string | null;
  dietaryRestrictions?: string | null;
};

/**
 * Standing customer profile: fill in anything newly provided, but do not
 * blank out notes or dietary restrictions just because this checkout left them empty.
 */
export const buildCustomerProfileUpdate = (
  updateData: CustomerProfileUpdate
): CustomerProfileUpdate => {
  const fieldsToUpdate: CustomerProfileUpdate = {};

  if (updateData.name) {
    fieldsToUpdate.name = updateData.name;
  }

  if (updateData.phoneNumber !== undefined) {
    fieldsToUpdate.phoneNumber = updateData.phoneNumber;
  }

  if (updateData.notes) {
    fieldsToUpdate.notes = updateData.notes;
  }

  if (updateData.dietaryRestrictions) {
    fieldsToUpdate.dietaryRestrictions = updateData.dietaryRestrictions;
  }

  return fieldsToUpdate;
};
