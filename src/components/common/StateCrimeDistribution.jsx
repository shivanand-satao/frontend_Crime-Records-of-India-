import { useState } from "react";

const stateData = [
    { state: "Maharashtra", percentage: 18 },
    { state: "Uttar Pradesh", percentage: 16 },
    { state: "Bihar", percentage: 12 },
    { state: "Rajasthan", percentage: 10 },
    { state: "Karnataka", percentage: 8 },
    { state: "Tamil Nadu", percentage: 7 },
    { state: "Gujarat", percentage: 6 },
    { state: "Madhya Pradesh", percentage: 5 },
    { state: "West Bengal", percentage: 4 },
    { state: "Punjab", percentage: 3 },
    { state: "Haryana", percentage: 3 },
    { state: "Kerala", percentage: 2 },
    { state: "Odisha", percentage: 2 },
    { state: "Assam", percentage: 1 }
];

const StateCrimeDistribution = () => {

    const [search, setSearch] = useState("");

    const filteredStates = stateData.filter((item) =>
        item.state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section
            className="state-distribution"
            data-aos="zoom-in"
        >

            <div className="distribution-header">

                <div data-aos="fade-right">

                    <h2>
                        Crime Distribution Across India
                    </h2>

                    <p className="distribution-subtitle">
                        Explore state-wise contribution to reported crimes
                    </p>

                </div>

                <input
                    type="text"
                    placeholder="🔍 Search State..."
                    value={search}
                    data-aos="fade-left"
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            <div
                className="histogram-container"
                data-aos="fade-up"
            >

                {filteredStates.map((item, index) => (

                    <div
                        key={index}
                        className="histogram-row"
                        data-aos="fade-right"
                        data-aos-delay={index * 50}
                    >

                        <span className="state-name">
                            {item.state}
                        </span>

                        <div className="bar-container">

                            <div
                                className="bar"
                                style={{
                                    width: `${item.percentage * 4}%`
                                }}
                            ></div>

                        </div>

                        <span className="percentage">
                            {item.percentage}%
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
};

export default StateCrimeDistribution;