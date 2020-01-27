import { validateRepositorySpecs, mongooseExtras } from '../utilities';

describe('utilities', () => {
  describe('validateRepositorySpecs', () => {
    it('succeeds on a happy pass', () => {
      const spec = getSpec();
      const result = validateRepositorySpecs(spec);
      expect(result).toBeTruthy;
    });
    it('rejects null input', () => {
      let error = null;
      try {
        // @ts-ignore
        validateRepositorySpecs(null);
      } catch (err) {
        error = err;
      }
      expect(error).not.toBeNull();
    });
    it('requires spec to contain a primaryKey', () => {
      let error = null;
      try {
        const spec = getSpec();
        spec.primaryKey = null;
        validateRepositorySpecs(spec);
      } catch (err) {
        error = err;
      }
      expect(error).not.toBeNull();
    });
    it('requres the primary key to exist on the schemaOptions', () => {
      let error = null;
      try {
        const spec = getSpec();
        spec.schemaOptions = {};
        validateRepositorySpecs(spec);
      } catch (err) {
        error = err;
      }
      expect(error).not.toBeNull();
    });
    it('insists that the primary key be a requiredfield', () => {
      let error = null;
      try {
        const spec = getSpec();
        spec.schemaOptions[spec.primaryKey].required = false;
        validateRepositorySpecs(spec);
      } catch (err) {
        error = err;
      }
      expect(error).not.toBeNull();
    });
    it('rejects schemas that use mongoose-reserved fields', () => {
      let error = null;
      try {
        let spec = getSpec();
        // @ts-ignore
        const illegalFields = Object.fromEntries(mongooseExtras.map(fieldName => [fieldName, {}]));
        spec = { ...spec, illegalFields };
        validateRepositorySpecs(spec);
      } catch (err) {
        error = err;
      }
      expect(error).not.toBeNull();
    });
  });
});

// helpers
const collectionName = 'TESTS',
  primaryKey = 'testId';

function getSpec() {
  return JSON.parse(
    JSON.stringify({
      collectionName,
      primaryKey,
      schemaOptions: {
        [primaryKey]: { required: true },
      },
    }),
  );
}
