export const createNestedObject = function(
	base: Record<any, any>, 
	names: string[], 
	value: any
) {
	// If a value is given, remove the last name and keep it for later:
	const lastName = names.pop();
	// Walk the hierarchy, creating new objects where needed.
	// If the lastName was removed, then the last object is not set yet:
	for ( let i = 0; i < names.length; i++ ) {
		base = base[names[i]] = base[names[i]] || { errors: [] };
	}

	// If a value was given, set it to the last name:
	if ( lastName ) base = base[lastName] = value;

	// Return the last object in the hierarchy:
	return base;
};
