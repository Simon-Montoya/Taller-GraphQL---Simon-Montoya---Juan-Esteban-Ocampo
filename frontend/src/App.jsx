import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_MEDICATIONS = gql`
  query GetMedications {
    medications {
      id
      name
      price
      presentation
      requiresPrescription
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_MEDICATIONS);

  if (loading) {
    return <p>Loading medications...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <main>
      <h1>Afirmative Pill</h1>

      <p>Pharmaceutical catalog</p>

      <section>
        {data.medications.map((medication) => (
          <article key={medication.id}>
            <h2>{medication.name}</h2>

            <p>{medication.presentation}</p>

            <p>
              Price: ${medication.price.toLocaleString()}
            </p>

            <p>
              {medication.requiresPrescription
                ? "Prescription required"
                : "No prescription required"}
            </p>

            <hr />
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;