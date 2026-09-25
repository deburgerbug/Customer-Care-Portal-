import { calculateAge } from "../../utils/calculateAge";

function BasicInformation({ customer, onChange, errors = {} }) {
  const age = customer.dob
    ? calculateAge(customer.dob)
    : "";

  return (
    <section className="form-card">
      <div className="card-header">
        <h2>Customer Basic Information</h2>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Enter first name"
            value={customer.firstName}
            onChange={onChange}
            className={errors.firstName ? "input-error" : ""}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Enter last name"
            value={customer.lastName}
            onChange={onChange}
            className={errors.lastName ? "input-error" : ""}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={customer.gender}
            onChange={onChange}
            className={errors.gender ? "input-error" : ""}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer Not to say">Prefer Not to say</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth *</label>
          <input
            id="dob"
            name="dob"
            type="date"
            max={new Date().toLocaleDateString("en-CA")}
            value={customer.dob}
            onChange={onChange}
            className={errors.dob ? "input-error" : ""}
          />
          {errors.dob && <span className="error-text">{errors.dob}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Age (Auto-calculated)</label>
          <input
            id="age"
            type="text"
            value={age || ""}
            readOnly
            className="input-readonly"
            placeholder="Calculated from DOB"
          />
        </div>
      </div>
    </section>
  );
}

export default BasicInformation;