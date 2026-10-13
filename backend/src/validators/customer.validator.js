import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");
export const customerIdParamsSchema = z.object({
  id: objectIdSchema,
});
export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(5),
  search: z.string().trim().max(100).optional(),
});
export const customerAndAddressParamsSchema = z.object({
  customerId: objectIdSchema,
  addressId: objectIdSchema,
});
export const customerAndCommunicationParamsSchema = z.object({
  customerId: objectIdSchema,
  communicationId: objectIdSchema,
});
const customerDateSchema = z.coerce.date().refine(
  (date) => date <= new Date(),
  "Date of birth cannot be in the future"
);

const addressSchema = z.object({
  _id: objectIdSchema.optional(),
  type: z.enum(["primary", "secondary"]),
  address: z.string().trim().min(1),
  pincode: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  country: z.string().trim().min(1),
});

const communicationSchema = z.object({
  _id: objectIdSchema.optional(),
  type: z.enum(["primary", "secondary"]),
  countryCode: z.string().trim().optional(),
  countrycode: z.string().trim().optional(),
  mobile: z.string().trim().min(1, "Mobile number is required"),
  email: z.string().trim().toLowerCase().email(),
}).transform((communication, context) => {
  const countryCode = communication.countryCode || communication.countrycode || "+91";
  const validMobile = countryCode === "+91"
    ? /^\d{10}$/.test(communication.mobile)
    : /^\d{6,15}$/.test(communication.mobile);

  if (!validMobile) {
    context.addIssue({
      code: "custom",
      path: ["mobile"],
      message: countryCode === "+91"
        ? "Mobile number for India (+91) must be exactly 10 digits"
        : "Mobile number must be between 6 and 15 digits",
    });
    return z.NEVER;
  }

  return {
    ...communication,
    countryCode,
    countrycode: undefined,
  };
});

const customerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  gender: z.enum(["Male", "Female", "Prefer Not to say"]),
  dob: customerDateSchema,
  assignedTo: objectIdSchema.nullable().optional(),
  addresses: z.array(addressSchema).min(1, "At least one address is required")
    .superRefine((addresses, context) => {
      const primaryCount = addresses.filter(({ type }) => type === "primary").length;
      if (primaryCount !== 1) {
        context.addIssue({
          code: "custom",
          message: "Customer must have exactly one primary address",
        });
      }
    }),
  communications: z.array(communicationSchema)
    .min(1, "At least one communication record is required")
    .superRefine((communications, context) => {
      const primaryCount = communications.filter(({ type }) => type === "primary").length;
      if (primaryCount !== 1) {
        context.addIssue({
          code: "custom",
          message: "Customer must have exactly one primary communication",
        });
      }
    }),
}).strict().transform(({ assignedTo, ...customerData }) => customerData);

export const createCustomerSchema = customerSchema;
export const updateCustomerSchema = customerSchema;
