<div
    className="stat-card"
    key={index}
    data-aos="zoom-in-up"
    data-aos-delay={index * 150}
>
    <div className="stat-icon">
        {stat.icon}
    </div>

    <h3>{stat.number}</h3>

    <h4>{stat.title}</h4>

    <p>{stat.description}</p>
</div>