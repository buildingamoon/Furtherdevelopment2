// Define the custom reducer for Message objects
export function messageReducer(data) {
  return data instanceof Object && data.sender ? { ...data, __type: 'Message' } : data;
}

// Define the custom reviver for Message objects
export function messageReviver(data) {
  return data && data.__type === 'Message' ? data : data;
}
