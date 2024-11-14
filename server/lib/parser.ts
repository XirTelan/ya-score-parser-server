import { getSession } from "../service/session";
import * as cheerio from "cheerio";
import { updateRating } from "../service/rating";
import { children } from "cheerio/dist/commonjs/api/traversing";
import { getContestById, updateStat } from "../service/contests";
import { ConfigType, ContestDTO, DataEntry } from "../types";

const CONTEST_URL = `https://contest.yandex.ru/contest`;

export async function fetchLeaderbord(contestId: string) {
  const session = (await getSession()) as ConfigType;
  if (!session?.value) return { success: false };
  const { value: sessionId } = session;
  const constestData = await getContestById(contestId);
  const contestInfo = await getContestInfo(contestId, sessionId);

  if (!sessionId) return;

  const queries = [];

  for (let i = 1; i <= contestInfo.lastPage; i++) {
    queries.push(
      fetchPage(contestId, i, sessionId, constestData?.attempts ?? "")
    );
  }
  const res = await Promise.all(queries);
  await updateRating(
    res.reduce((acc, cur) => {
      return [...acc, ...cur];
    }, []),
    contestId
  );
  await updateStat(contestId, { stats: contestInfo.total, date: Date.now() });
  return 0;
}

export async function getContestInfo(contestId: string, sessionId: string) {
  const url = `${CONTEST_URL}/${contestId}/standings/?p=1}`;
  const responce = await fetch(url, {
    headers: {
      cookie: `Session_id=${sessionId}`,
    },
    cache: "no-cache",
  });
  const $ = cheerio.load(await responce.text());
  const $pager = $(".pager>a")
    .toArray()
    .map((x) => {
      return $(x).text();
    });

  const $top = $(".table__head>.table__row")[0];
  const tasksInfo = $top.childNodes
    .slice(2, $top.childNodes.length - 2)
    .map((x, indx) => {
      const str = $(x).text();
      const [success, attempts] = str.slice(1).split("/").map(Number);
      return { task: str[0], success, attempts };
    });

  const result = {
    total: tasksInfo ?? [],
    lastPage: Number($pager.at(-1)),
  };

  return result;
}

async function fetchPage(
  contestId: string,
  page: number,
  sessionId: string,
  attempts: string
) {
  const url = `${CONTEST_URL}/${contestId}/standings/?p=${page}`;
  const responce = await fetch(url, {
    headers: {
      cookie: `Session_id=${sessionId}`,
    },
    cache: "no-cache",
  });
  const $ = cheerio.load(await responce.text());

  const tasks = attempts
    .split(",")
    .map(Number)
    .filter((task) => task != 0);

  const $rows = $(".table__body>.table__row");
  const pageData: DataEntry[] = [];
  $rows.each((i, row) => {
    const columnCount = row.childNodes.length;
    const countTries = () => {
      let sum = 0;
      tasks.forEach((task) => {
        if (task > columnCount - 4) return;
        const attemptsChild = $(row.childNodes[1 + task])
          .children()
          .toArray()[0];
        const attempt = $(attemptsChild).text();
        const num = Number(attempt);
        if (num > 100) throw new Error(`${task} - ${attempt}`);
        sum += attempt.startsWith("+") ? Number(attempt) || 0 : 0;
      });
      return sum;
    };

    const newEntry = {
      id: $(row.childNodes[1]).children().attr("title") ?? "",
      tasks: $(row.childNodes[columnCount - 2]).text(),
      fine: $(row.childNodes[columnCount - 1]).text(),
      tries: tasks.length > 0 ? countTries() : 0,
    };
    if (newEntry.id === "") return;
    pageData.push(newEntry);
  });
  return pageData;
}
