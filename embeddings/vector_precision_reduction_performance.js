const reduce_precision_to_fixed = (vec, factor) => {
  const precision = Math.min(...vec.map(val => (val.toString().split('.')[1] || '').length));
  return vec.map(val => parseFloat(val.toFixed(Math.max(1, Math.floor(precision / factor)))));
};

const reduce_precision_math_round = (vec, factor) => {
  const precision = Math.min(...vec.map(val => (val.toString().split('.')[1] || '').length));
  return vec.map(val => Math.round(val * Math.pow(10, Math.max(1, Math.floor(precision / factor)))) / Math.pow(10, Math.max(1, Math.floor(precision / factor))));
};

// Function to generate a test vector
const generate_test_vector = (size) => {
  return Array.from({ length: size }, () => Math.random() * 100);
};

// Function to measure the performance
const measure_performance = (func, vec, factor, iterations) => {
  let startTime, endTime, total = 0;
  for (let i = 0; i < iterations; i++) {
      startTime = performance.now();
      func(vec, factor);
      endTime = performance.now();
      total += endTime - startTime;
  }
  return total / iterations;
};

// Test the functions
const test_sizes = [384, 768, 1536, 3072, 6144, 12288];
const factor = 2; // reduce precision by half
const iterations = 100; // number of iterations to measure performance

console.log('Performance Results:');
test_sizes.forEach(size => {
  const test_vector = generate_test_vector(size);
  const avgTimeFixed = measure_performance(reduce_precision_to_fixed, test_vector, factor, iterations);
  const avgTimeRound = measure_performance(reduce_precision_math_round, test_vector, factor, iterations);

  console.log(`Size: ${size}`);
  console.log(`Round: ${avgTimeRound.toFixed(4)} ms`);
  console.log(`Fixed: ${avgTimeFixed.toFixed(4)} ms (+${((avgTimeFixed - avgTimeRound) / avgTimeRound * 100).toFixed(2)}%)`);
});
