function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

const model = {
    weight: [-0.02, 0.35, -0.20],
    bias: -0.5
};

function predictChurn(features) {
    let score = model.bias;

    for (let i = 0; i < model.weight.length; i++) {
        score += model.weight[i] * features[i];
    }

    return Number(sigmoid(score).toFixed(6));
}

// Test users
const tests = [
    {
        name: "Super Active",
        features: [500, 0, 50]
    },
    {
        name: "Dead User",
        features: [0, 45, 0]
    },
    {
        name: "Medium User",
        features: [30, 5, 5]
    },
    {
        name: "Low activity but recently active",
        features: [5, 1, 3]
    },
    {
        name: "Inactive but high historical activity",
        features: [300, 30, 20]
    }
];

for (const t of tests) {
    console.log(
        `${t.name} → features ${JSON.stringify(t.features)} → churnScore =`,
        predictChurn(t.features)
    );
}
