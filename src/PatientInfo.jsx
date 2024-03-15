import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const BE_API = "";

const PatientInfo = () => {
  // const [code, setCode] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  console.log("Code:", code);
  const [accessToken, setAccessToken] = useState("");
  const [patient, setPatient] = useState("");
  const [patientData, setPatientData] = useState({});
  const clientId = "42f3b173-16a8-4c50-a3ea-0269294cb869";
  const redirect = window.location.origin;
  // process.env.NODE_ENV === "production"
  //   ? "https://lucid-wozniak-940eae.netlify.app"
  //   : "http://localhost:3000";

  const authorizeLink = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&redirect_uri=${redirect}&client_id=${clientId}&state=1234&scope=patient.read, patient.search`;

  const sendAccessTokenToBE = (accessToken) => {
    if (BE_API) {
      axios
        .post(BE_API, {
          accessToken,
        })
        .then(() => {
          console.log("Acess token sent successfully");
        })
        .catch((err) => {
          console.log("Error in sending access token: ", err);
        });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", redirect);
      params.append("code", code);
      params.append("client_id", clientId);
      params.append("state", "1234");
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      try {
        const response = await axios.post(
          "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
          params,
          config
        );
        setAccessToken(response.data.access_token);
        sendAccessTokenToBE(response.data.access_token);
        setPatient(response.data.patient);
      } catch (error) {
        console.log(error);
      }
    };

    if (code !== "") {
      fetchData();
    }
  }, [code, clientId, redirect]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patient}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setPatientData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (accessToken !== "") {
      fetchPatientData();
    }
  }, [accessToken, patient]);

  return (
    <div className="container">
      <div style={{ textAlign: "center" }}>
        <h1>Smart on FHIR - Patient Info</h1>
        <p>
          <strong>Username:</strong> fhircamila
        </p>
        <p>
          <strong>Password:</strong> epicepic1
        </p>
        {!code && (
          <a
            className="btn btn-info"
            style={{ textDecoration: "none" }}
            href={authorizeLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign in
          </a>
        )}
        <hr />
      </div>
      {accessToken && (
        <div>
          <p>
            <strong>Patient Id:</strong> {patient}
          </p>
          <strong>Name: </strong>
          {patientData.name && patientData.name[0].text}
          <br />
          <strong>Birth Date: </strong>
          {patientData.birthDate}
          <br />
          <strong>Gender: </strong>
          {patientData.gender}
          <br />
          <strong>Vital Status: </strong>
          {patientData.deceasedBoolean ? "Dead" : "Alive"}
          <br />
          <strong>Marital Status: </strong>
          {patientData.maritalStatus && patientData.maritalStatus.text}
          <br />
          <strong>Telecom: </strong> <br />
          {patientData.telecom &&
            patientData.telecom.map((telecom) => (
              <div className="ml-2" key={telecom.value}>
                <strong>{telecom.system}</strong> - {telecom.use}{" "}
                {telecom.value}
              </div>
            ))}
          <strong>Address: </strong> <br />
          {patientData.address &&
            patientData.address.map((address) => (
              <div className="ml-2" key={address.use}>
                <strong>{address.use} -</strong> {address.line.toString()},{" "}
                {address.city}, {address.district}, {address.state},{" "}
                {address.postalCode}, {address.country}{" "}
                {address.period?.start && <strong>From</strong>}
                {address.period?.start}
              </div>
            ))}
          <strong>Language: </strong>
          {patientData.communication &&
            patientData.communication[0].language.coding[0].display}
          <br />
          <strong>General Practitioner </strong>
          {patientData.generalPractitioner &&
            patientData.generalPractitioner[0].display}
          <br />
          <strong>Managing Organization </strong>
          {patientData.managingOrganization &&
            patientData.managingOrganization.display}
          <hr />
          <strong>Access code:</strong>
          <p className="ml-2" style={{ wordBreak: "break-all" }}>
            {accessToken}
          </p>
          <strong>Patient Resource:</strong>
          <pre>{JSON.stringify(patientData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PatientInfo;
