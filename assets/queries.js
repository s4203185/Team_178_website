export const landingQueries = {
  totalAccidents: "SELECT COUNT(*) AS total FROM Accident",
  totalKilled: "SELECT SUM(NO_PERSONS_KILLED) AS total FROM Accident",
  totalSerious: "SELECT SUM(NO_PERSONS_INJ_SERIOUS) AS total FROM Accident",
  totalPersons: "SELECT SUM(NO_PERSONS) AS total FROM Accident",
  lightData: `
    SELECT lc.COND_NAME, COUNT(*) AS cnt
    FROM Accident a JOIN Light_Condition lc ON a.LIGHT_CONDITION = lc.COND_ID
    GROUP BY lc.COND_NAME ORDER BY cnt DESC LIMIT 6
  `,
  speedData: `
    SELECT SPEED_ZONE, COUNT(*) AS cnt
    FROM Accident
    WHERE SPEED_ZONE NOT IN (999,777,0)
    GROUP BY SPEED_ZONE ORDER BY cnt DESC LIMIT 8
  `,
  yearData: `
    SELECT substr(ACCIDENT_DATE,-4) AS yr, COUNT(*) AS cnt
    FROM Accident GROUP BY yr ORDER BY yr
  `,
  lgaData: `
    SELECT n.LGA_NAME, COUNT(*) AS cnt
    FROM Accident a JOIN Node n ON a.NODE_ID = n.NODE_ID
    WHERE n.LGA_NAME IS NOT NULL AND n.LGA_NAME != ''
    GROUP BY n.LGA_NAME ORDER BY cnt DESC LIMIT 10
  `
};

export const conditionsQueries = {
  atmospheric: `
    SELECT ac.ATMOSPH_COND_DESC AS condition_name,
      COUNT(DISTINCT acs.ACCIDENT_NO) AS accident_count,
      SUM(a.NO_PERSONS_KILLED) AS total_killed,
      SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
      ROUND(AVG(a.SPEED_ZONE),1) AS avg_speed_zone
    FROM Atmospheric_Cond_Seq acs
    JOIN Amospheric_Cond ac ON acs.ATMOSPH_COND = ac.ATMOSPH_COND
    JOIN Accident a ON acs.ACCIDENT_NO = a.ACCIDENT_NO
    WHERE ac.ATMOSPH_COND_DESC != 'Not known'
    GROUP BY ac.ATMOSPH_COND_DESC ORDER BY accident_count DESC
  `,
  surface: `
    SELECT rsc.SURFACE_COND_DESC AS condition_name,
      COUNT(DISTINCT scs.ACCIDENT_NO) AS accident_count,
      SUM(a.NO_PERSONS_KILLED) AS total_killed,
      SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
      ROUND(AVG(a.SPEED_ZONE),1) AS avg_speed_zone
    FROM Surface_Cond_Seq scs
    JOIN Road_Surface_Cond rsc ON scs.SURFACE_COND = rsc.SURFACE_COND
    JOIN Accident a ON scs.ACCIDENT_NO = a.ACCIDENT_NO
    WHERE rsc.SURFACE_COND_DESC != 'Unk.'
    GROUP BY rsc.SURFACE_COND_DESC ORDER BY accident_count DESC
  `,
  light: `
    SELECT lc.COND_NAME AS condition_name,
      COUNT(*) AS accident_count,
      SUM(a.NO_PERSONS_KILLED) AS total_killed,
      SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
      ROUND(AVG(a.SPEED_ZONE),1) AS avg_speed_zone
    FROM Accident a
    JOIN Light_Condition lc ON a.LIGHT_CONDITION = lc.COND_ID
    WHERE lc.COND_NAME != 'Unknown'
    GROUP BY lc.COND_NAME ORDER BY accident_count DESC
  `
};

export const peopleQueries = {
  injury: `
    SELECT i.INJ_LEVEL_DESC AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN p.SEX='M' THEN 1 ELSE 0 END) AS male_count,
      SUM(CASE WHEN p.SEX='F' THEN 1 ELSE 0 END) AS female_count
    FROM Person p JOIN Injury i ON p.INJ_LEVEL = i.INJ_LEVEL
    GROUP BY i.INJ_LEVEL_DESC ORDER BY person_count DESC
  `,
  age: `
    SELECT COALESCE(p.AGE_GROUP,'Unknown') AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN p.SEX='M' THEN 1 ELSE 0 END) AS male_count,
      SUM(CASE WHEN p.SEX='F' THEN 1 ELSE 0 END) AS female_count
    FROM Person p
    WHERE p.AGE_GROUP IS NOT NULL AND p.AGE_GROUP != ''
    GROUP BY p.AGE_GROUP ORDER BY person_count DESC
  `,
  ejection: `
    SELECT e.EJECTED_DESC AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN p.SEX='M' THEN 1 ELSE 0 END) AS male_count,
      SUM(CASE WHEN p.SEX='F' THEN 1 ELSE 0 END) AS female_count
    FROM Person p JOIN Ejection e ON p.EJECTED_CODE = e.EJECTED_CODE
    GROUP BY e.EJECTED_DESC ORDER BY person_count DESC
  `,
  road_user: `
    SELECT ru.ROAD_USER_TYPE_DESC AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN p.SEX='M' THEN 1 ELSE 0 END) AS male_count,
      SUM(CASE WHEN p.SEX='F' THEN 1 ELSE 0 END) AS female_count
    FROM Person p JOIN Road_User ru ON p.ROAD_USER_TYPE = ru.ROAD_USER_TYPE
    GROUP BY ru.ROAD_USER_TYPE_DESC ORDER BY person_count DESC
  `
};

export const deepConditionsQueries = {
  fatality_rate: `
    SELECT condition_name, accident_count, total_killed, total_serious, fatality_rate, serious_rate,
      RANK() OVER (ORDER BY fatality_rate DESC) AS rank
    FROM (
      SELECT ac.ATMOSPH_COND_DESC AS condition_name,
        COUNT(DISTINCT acs.ACCIDENT_NO) AS accident_count,
        SUM(a.NO_PERSONS_KILLED) AS total_killed,
        SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
        ROUND(CAST(SUM(a.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(DISTINCT acs.ACCIDENT_NO),0)*100,3) AS fatality_rate,
        ROUND(CAST(SUM(a.NO_PERSONS_INJ_SERIOUS) AS FLOAT)/NULLIF(COUNT(DISTINCT acs.ACCIDENT_NO),0)*100,2) AS serious_rate
      FROM Atmospheric_Cond_Seq acs
      JOIN Amospheric_Cond ac ON acs.ATMOSPH_COND = ac.ATMOSPH_COND
      JOIN Accident a ON acs.ACCIDENT_NO = a.ACCIDENT_NO
      WHERE ac.ATMOSPH_COND_DESC != 'Not known'
      GROUP BY ac.ATMOSPH_COND_DESC
    ) sub
    WHERE fatality_rate > (
      SELECT AVG(fatality_rate) FROM (
        SELECT ROUND(CAST(SUM(a.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(DISTINCT acs.ACCIDENT_NO),0)*100,3) AS fatality_rate
        FROM Atmospheric_Cond_Seq acs
        JOIN Accident a ON acs.ACCIDENT_NO = a.ACCIDENT_NO
        JOIN Amospheric_Cond ac ON acs.ATMOSPH_COND = ac.ATMOSPH_COND
        WHERE ac.ATMOSPH_COND_DESC != 'Not known'
        GROUP BY ac.ATMOSPH_COND_DESC
      )
    ) ORDER BY fatality_rate DESC
  `,
  speed_fatality: `
    SELECT speed_zone AS condition_name, accident_count, total_killed, total_serious, fatality_rate, serious_rate,
      RANK() OVER (ORDER BY fatality_rate DESC) AS rank
    FROM (
      SELECT CAST(a.SPEED_ZONE AS TEXT)||' km/h' AS speed_zone, COUNT(*) AS accident_count,
        SUM(a.NO_PERSONS_KILLED) AS total_killed,
        SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
        ROUND(CAST(SUM(a.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fatality_rate,
        ROUND(CAST(SUM(a.NO_PERSONS_INJ_SERIOUS) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS serious_rate
      FROM Accident a WHERE a.SPEED_ZONE NOT IN (999,777,0)
      GROUP BY a.SPEED_ZONE HAVING COUNT(*) > 50
    ) sub
    WHERE fatality_rate > (
      SELECT AVG(fr) FROM (
        SELECT ROUND(CAST(SUM(a2.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fr
        FROM Accident a2 WHERE a2.SPEED_ZONE NOT IN (999,777,0)
        GROUP BY a2.SPEED_ZONE HAVING COUNT(*) > 50
      )
    ) ORDER BY fatality_rate DESC
  `,
  light_risk: `
    SELECT condition_name, accident_count, total_killed, total_serious, fatality_rate, serious_rate,
      RANK() OVER (ORDER BY fatality_rate DESC) AS rank
    FROM (
      SELECT lc.COND_NAME AS condition_name, COUNT(*) AS accident_count,
        SUM(a.NO_PERSONS_KILLED) AS total_killed,
        SUM(a.NO_PERSONS_INJ_SERIOUS) AS total_serious,
        ROUND(CAST(SUM(a.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fatality_rate,
        ROUND(CAST(SUM(a.NO_PERSONS_INJ_SERIOUS) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS serious_rate
      FROM Accident a JOIN Light_Condition lc ON a.LIGHT_CONDITION = lc.COND_ID
      WHERE lc.COND_NAME != 'Unknown'
      GROUP BY lc.COND_NAME
    ) sub
    WHERE fatality_rate > (
      SELECT AVG(fr) FROM (
        SELECT ROUND(CAST(SUM(a2.NO_PERSONS_KILLED) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fr
        FROM Accident a2 JOIN Light_Condition lc2 ON a2.LIGHT_CONDITION = lc2.COND_ID
        WHERE lc2.COND_NAME != 'Unknown' GROUP BY lc2.COND_NAME
      )
    ) ORDER BY fatality_rate DESC
  `
};

export const deepPeopleQueries = {
  high_risk_age: `
    SELECT age_group AS category, person_count, hospital_count, fatality_count, hospital_rate, fatality_rate,
      RANK() OVER (ORDER BY hospital_rate DESC) AS rank
    FROM (
      SELECT COALESCE(p.AGE_GROUP,'Unknown') AS age_group,
        COUNT(*) AS person_count,
        SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
        SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS fatality_count,
        ROUND(CAST(SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS hospital_rate,
        ROUND(CAST(SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fatality_rate
      FROM Person p LEFT JOIN Injury i ON p.INJ_LEVEL = i.INJ_LEVEL
      WHERE p.AGE_GROUP IS NOT NULL AND p.AGE_GROUP != ''
      GROUP BY p.AGE_GROUP
    ) sub
    WHERE hospital_rate > (
      SELECT AVG(hr) FROM (
        SELECT ROUND(CAST(SUM(CASE WHEN p2.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS hr
        FROM Person p2 WHERE p2.AGE_GROUP IS NOT NULL GROUP BY p2.AGE_GROUP
      )
    ) ORDER BY hospital_rate DESC
  `,
  unprotected: `
    SELECT hb.HELMET_BELT_DESC AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS fatality_count,
      ROUND(CAST(SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS hospital_rate,
      ROUND(CAST(SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fatality_rate,
      RANK() OVER (ORDER BY ROUND(CAST(SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) DESC) AS rank
    FROM Person p
    JOIN Helmet_Belt hb ON p.HELMET_BELT_WORN = hb.HELMET_BELT_WORN
    LEFT JOIN Injury i ON p.INJ_LEVEL = i.INJ_LEVEL
    GROUP BY hb.HELMET_BELT_DESC
    HAVING COUNT(*) > 5
    ORDER BY fatality_rate DESC
  `,
  road_user_risk: `
    SELECT ru.ROAD_USER_TYPE_DESC AS category, COUNT(*) AS person_count,
      SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS hospital_count,
      SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS fatality_count,
      ROUND(CAST(SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) AS hospital_rate,
      ROUND(CAST(SUM(CASE WHEN i.INJ_LEVEL_DESC='Fatality' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,3) AS fatality_rate,
      RANK() OVER (ORDER BY ROUND(CAST(SUM(CASE WHEN p.TAKEN_HOSPITAL='Y' THEN 1 ELSE 0 END) AS FLOAT)/NULLIF(COUNT(*),0)*100,2) DESC) AS rank
    FROM Person p
    JOIN Road_User ru ON p.ROAD_USER_TYPE = ru.ROAD_USER_TYPE
    LEFT JOIN Injury i ON p.INJ_LEVEL = i.INJ_LEVEL
    GROUP BY ru.ROAD_USER_TYPE_DESC
    HAVING COUNT(*) > 10
    ORDER BY hospital_rate DESC
  `
};
