import { FiAlertTriangle, FiArchive, FiHome, FiShield, FiTruck, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";

const datasets = [
    {
        Icon: FiTruck,
        table: "auto_theft",
        title: "Auto Theft",
        description: "Track vehicle theft trends across India."
    },
    {
        Icon: FiUsers,
        table: "victims_of_rape",
        title: "Victims of Rape",
        description: "Analyze crime statistics involving victims."
    },
    {
        Icon: FiAlertTriangle,
        table: "serious_fraud",
        title: "Serious Fraud",
        description: "Monitor financial and cyber fraud patterns."
    },
    {
        Icon: FiHome,
        table: "police_housing",
        title: "Police Housing",
        description: "Explore police infrastructure datasets."
    },
    {
        Icon: FiArchive,
        table: "property_stolen_and_recovered",
        title: "Property Recovery",
        description: "Recovered property and asset records."
    },
    {
        Icon: FiShield,
        table: "human_rights_violation_by_police",
        title: "Human Rights Violations",
        description: "Insights into human rights related crimes."
    }
];

const FeaturedDatasets = () => {
    return (
        <section className="datasets-section" id="datasets">
            <h2 className="visually-hidden">Featured datasets</h2>
            <div className="dataset-grid">
                {datasets.map(({ Icon, ...dataset }) => (
                    <div
                        key={dataset.table}
                        className="dataset-card"
                    >
                        <div className="dataset-icon">
                            <Icon />
                        </div>
                        <h3>{dataset.title}</h3>
                        <p>{dataset.description}</p>
                        <Link to={`/dashboard/datasets/${dataset.table}`} className="dataset-open-link">Explore dataset <span aria-hidden="true">↗</span></Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedDatasets;
