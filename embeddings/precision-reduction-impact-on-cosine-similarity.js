// blog post: https://wfhbrian.com/vector-dimension-precision-effect-on-cosine-similarity
// Function to compute the dot product of two 384-dimensional vectors
const dot_product = (vec1, vec2) => vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);

// Function to compute the magnitude of a 384-dimensional vector
const magnitude = vec => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

// Function to compute cosine similarity between two 384-dimensional vectors
const cosine_similarity = (vec1, vec2) => dot_product(vec1, vec2) / (magnitude(vec1) * magnitude(vec2));

// Function to reduce the precision of vector components
const reduce_precision_to_fixed = (vec, factor) => {
    const precision = Math.min(...vec.map(val => (val.toString().split('.')[1] || '').length));
    return vec.map(val => parseFloat(val.toFixed(Math.max(1, Math.floor(precision / factor)))));
};
const reduce_precision_math_round = (vec, factor) => {
    const precision = Math.min(...vec.map(val => (val.toString().split('.')[1] || '').length));
    return vec.map(val => Math.round(val * Math.pow(10, Math.max(1, Math.floor(precision / factor)))) / Math.pow(10, Math.max(1, Math.floor(precision / factor))));
};

// Function to calculate the average difference over multiple iterations for different precision reductions
const calculate_average_differences = (iterations, gen_control=generate_vector_16_384) => {
    let differences = {
      precision_half_to_fixed: 0,
      precision_half_math_round: 0,
      precision_third_to_fixed: 0,
      precision_third_math_round: 0,
      precision_quarter_to_fixed: 0,
      precision_quarter_math_round: 0,
      precision_fifth_to_fixed: 0,
      precision_fifth_math_round: 0,
    };

    for (let i = 0; i < iterations; i++) {
        const vector_a = gen_control();
        const vector_b = gen_control();
        const original_cosine_similarity = cosine_similarity(vector_a, vector_b);

        ['half', 'third', 'quarter', 'fifth'].forEach((factor, index) => {
            const reduced_factor = index + 2; // 2 for half, 3 for third, etc.
            const reduced_vector_a_math_round = reduce_precision_math_round(vector_a, reduced_factor);
            const reduced_vector_b_math_round = reduce_precision_math_round(vector_b, reduced_factor);
            const reduced_cosine_similarity_math_round = cosine_similarity(reduced_vector_a_math_round, reduced_vector_b_math_round);
            differences[`precision_${factor}_math_round`] += Math.abs(original_cosine_similarity - reduced_cosine_similarity_math_round);
            const reduced_vector_a_to_fixed = reduce_precision_to_fixed(vector_a, reduced_factor);
            const reduced_vector_b_to_fixed = reduce_precision_to_fixed(vector_b, reduced_factor);
            const reduced_cosine_similarity_to_fixed = cosine_similarity(reduced_vector_a_to_fixed, reduced_vector_b_to_fixed);
            differences[`precision_${factor}_to_fixed`] += Math.abs(original_cosine_similarity - reduced_cosine_similarity_to_fixed);
            
        });
    }

    // Calculate average differences
    Object.keys(differences).forEach(key => {
        differences[key] = ((differences[key] / iterations) * 100).toFixed(10) + '%';
    });

    return differences;
};

// Generate control vectors
const generate_vector_16_384 = () => Array.from({ length: 384 }, () => Math.random());
const generate_vector_16_1536 = () => Array.from({ length: 1536 }, () => Math.random());
const generate_vector_8_384 = () => Array.from({ length: 384 }, () => Math.random() * 0.5);
const generate_vector_8_1536 = () => Array.from({ length: 1536 }, () => Math.random() * 0.5);

// Perform 100 iterations and calculate the average differences for each precision reduction
const average_differences_16_384 = calculate_average_differences(1000, generate_vector_16_384, reduce_precision_to_fixed);
console.log('Average differences for 16-bit vectors (384-dim):', average_differences_16_384);
const average_differences_16_1536 = calculate_average_differences(1000, generate_vector_16_1536, reduce_precision_to_fixed);
console.log('Average differences for 16-bit vectors (1536-dim):', average_differences_16_1536);
const average_differences_8_384 = calculate_average_differences(1000, generate_vector_8_384, reduce_precision_to_fixed);
console.log('Average differences for 8-bit vectors (384-dim):', average_differences_8_384);
const average_differences_8_1536 = calculate_average_differences(1000, generate_vector_8_1536, reduce_precision_to_fixed);
console.log('Average differences for 8-bit vectors (1536-dim):', average_differences_8_1536);