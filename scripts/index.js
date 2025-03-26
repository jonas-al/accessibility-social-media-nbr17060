import gplay from "google-play-scraper";
import store from "app-store-scraper";
import express from "express";
import translate from "translate";
import fs from "fs";
import { text } from "stream/consumers";

function converterParaCSV(objetos) {
  const cabecalho = Object.keys(objetos[0]);
  const linhas = objetos.map((obj) =>
    cabecalho.map((campo) => JSON.stringify(obj[campo], replacer)).join(";")
  );

  return [cabecalho.join(";"), ...linhas].join("\r\n");
}

function replacer(key, value) {
  // Substitui valores nulos ou indefinidos por string vazia
  return value === null || value === undefined ? "" : value;
}

const app = express();
const port = 3000;

app.use(express.json());

app.post("/test", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

app.get("/android-apps-list", async (req, res) => {
  let response = "teste";
  const fetch = async () => {
    await gplay
      .list({
        collection: gplay.collection.TOP_FREE,
      })
      .then((data) => (response = data));
  };

  await fetch();

  res.send(response);
});

app.get("/ios-apps-list", async (req, res) => {
  let response = "teste";
  const fetch = async () => {
    await store
      .list({
        collection: store.collection.TOP_FREE_IOS,
      })
      .then((data) => (response = data));
  };

  await fetch();

  res.send(response);
});

app.post("/google-play-reviews", async (req, res) => {
  const response = [];
  console.log(req.body);
  const fetch = async () => {
    await gplay
      .reviews({
        appId: req.body.appId,
        collection: gplay.collection.TOP_FREE,
        sort: gplay.sort.HELPFULNESS,
        num: req.body.qt,
      })
      .then(async (res) => {
        for (const review of res.data) {
          if (
            review.text &&
            (review.text.toLowerCase().includes("disability") ||
              review.text.toLowerCase().includes("accessibility") ||
              review.text.toLowerCase().includes("inclusive") ||
              review.text.toLowerCase().includes("assistive technology") ||
              review.text.toLowerCase().includes("special needs") ||
              // Deficiência visual
              review.text.toLowerCase().includes("blind") ||
              review.text.toLowerCase().includes("visually impaired") ||
              review.text.toLowerCase().includes("low vision") ||
              review.text.toLowerCase().includes("screen reader") ||
              review.text.toLowerCase().includes("braille") ||
              review.text.toLowerCase().includes("voiceover") ||
              review.text.toLowerCase().includes("talkback") ||
              review.text.toLowerCase().includes("text-to-speech") ||
              review.text.toLowerCase().includes("audio description") ||
              review.text.toLowerCase().includes("magnifier") ||
              review.text.toLowerCase().includes("contrast settings") ||
              review.text.toLowerCase().includes("color blindness") ||
              review.text.toLowerCase().includes("large text") ||
              review.text.toLowerCase().includes("high contrast") ||
              // Deficiência auditiva
              review.text.toLowerCase().includes("deaf") ||
              review.text.toLowerCase().includes("hard of hearing") ||
              review.text.toLowerCase().includes("hearing impairment") ||
              review.text.toLowerCase().includes("sign language") ||
              review.text.toLowerCase().includes("closed captions") ||
              // review.text.toLowerCase().includes("captions") ||
              review.text.toLowerCase().includes("subtitles") ||
              // Deficiência física/motora
              review.text.toLowerCase().includes("wheelchair") ||
              review.text.toLowerCase().includes("reduced mobility") ||
              review.text.toLowerCase().includes("motor disability") ||
              review.text.toLowerCase().includes("voice control") ||
              review.text.toLowerCase().includes("voice command") ||
              review.text.toLowerCase().includes("switch control") ||
              review.text.toLowerCase().includes("adaptive device") ||
              // Deficiência intelectual/neurodivergência
              review.text.toLowerCase().includes("autism") ||
              review.text.toLowerCase().includes("asd") ||
              review.text.toLowerCase().includes("adhd") ||
              review.text.toLowerCase().includes("dyslexia") ||
              review.text.toLowerCase().includes("cognitive impairment") ||
              review.text.toLowerCase().includes("intellectual disability") ||
              review.text.toLowerCase().includes("neurodiverse"))
          ) {
            try {
              const textInPt = await translate(review.text, "pt");

              response.push({
                en: review.text,
                pt: textInPt,
                date: new Date(review.date).toLocaleDateString(),
              });
            } catch (error) {
              console.log("Erro ao traduzir texto:", error);
            }
          }
        }
      });
  };

  await fetch();
  console.log(`${response.length} RESULTADOS ENCONTRADOS`);

  if (response.length === 0) return res.send("Nenhum resultado encontrado");

  const csvString = converterParaCSV(response);

  const nomeDoArquivo = `dados_${req.body.appId}.csv`;

  fs.writeFile(nomeDoArquivo, csvString, "utf8", (err) => {
    if (err) {
      console.error("Erro ao salvar o arquivo CSV:", err);
    } else {
      console.log(`Arquivo ${nomeDoArquivo} salvo com sucesso!`);
    }
  });

  res.send(response);
});

app.get("/app-store-reviews", async (req, res) => {
  const response = [];
  console.log(req.body);
  const fetch = async () => {
    for (let index = 1; index <= req.body.qt; index++) {
      await store
        .reviews({
          appId: req.body.appId,
          sort: store.sort.HELPFUL,
          page: index,
        })
        .then(async (data) => {
          for (const review of data) {
            if (
              review.text &&
              (review.text.toLowerCase().includes("disability") ||
                review.text.toLowerCase().includes("accessibility") ||
                review.text.toLowerCase().includes("inclusive") ||
                review.text.toLowerCase().includes("assistive technology") ||
                review.text.toLowerCase().includes("special needs") ||
                // Deficiência visual
                review.text.toLowerCase().includes("blind") ||
                review.text.toLowerCase().includes("visually impaired") ||
                review.text.toLowerCase().includes("low vision") ||
                review.text.toLowerCase().includes("screen reader") ||
                review.text.toLowerCase().includes("braille") ||
                review.text.toLowerCase().includes("voiceover") ||
                review.text.toLowerCase().includes("talkback") ||
                review.text.toLowerCase().includes("text-to-speech") ||
                review.text.toLowerCase().includes("audio description") ||
                review.text.toLowerCase().includes("magnifier") ||
                review.text.toLowerCase().includes("contrast settings") ||
                review.text.toLowerCase().includes("color blindness") ||
                review.text.toLowerCase().includes("large text") ||
                review.text.toLowerCase().includes("high contrast") ||
                // Deficiência auditiva
                review.text.toLowerCase().includes("deaf") ||
                review.text.toLowerCase().includes("hard of hearing") ||
                review.text.toLowerCase().includes("hearing impairment") ||
                review.text.toLowerCase().includes("sign language") ||
                review.text.toLowerCase().includes("closed captions") ||
                // review.text.toLowerCase().includes("captions") ||
                review.text.toLowerCase().includes("subtitles") ||
                // Deficiência física/motora
                review.text.toLowerCase().includes("wheelchair") ||
                review.text.toLowerCase().includes("reduced mobility") ||
                review.text.toLowerCase().includes("motor disability") ||
                review.text.toLowerCase().includes("voice control") ||
                review.text.toLowerCase().includes("voice command") ||
                review.text.toLowerCase().includes("switch control") ||
                review.text.toLowerCase().includes("adaptive device") ||
                // Deficiência intelectual/neurodivergência
                review.text.toLowerCase().includes("autism") ||
                review.text.toLowerCase().includes("asd") ||
                review.text.toLowerCase().includes("adhd") ||
                review.text.toLowerCase().includes("dyslexia") ||
                review.text.toLowerCase().includes("cognitive impairment") ||
                review.text.toLowerCase().includes("intellectual disability") ||
                review.text.toLowerCase().includes("neurodiverse"))
            ) {
              try {
                const textInPt = await translate(review.text, "pt");

                response.push({
                  en: review.text,
                  pt: textInPt,
                  date: new Date(review.updated).toLocaleDateString(),
                });
              } catch (error) {
                console.log("Erro ao traduzir texto:", error);
              }
            }
          }
        });
    }
  };

  await fetch();
  console.log(`${response.length} RESULTADOS ENCONTRADOS`);

  if (response.length === 0) return res.send("Nenhum resultado encontrado");

  const csvString = converterParaCSV(response);

  const nomeDoArquivo = `dados_${req.body.appId}.csv`;

  fs.writeFile(nomeDoArquivo, csvString, "utf8", (err) => {
    if (err) {
      console.error("Erro ao salvar o arquivo CSV:", err);
    } else {
      console.log(`Arquivo ${nomeDoArquivo} salvo com sucesso!`);
    }
  });

  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
