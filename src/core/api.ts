import { Page } from 'playwright';
import { URLS } from '../constant/url.js';
import { LogBookSavePayload } from '../types/bot.js';

export const EMPTY_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Save one logbook entry via LogBook/StudentSave, reusing the logged-in browser session.
 * EMPTY_ID creates a new entry, an existing entry ID updates that entry.
 */
export async function saveLogBookEntry(page: Page, payload: LogBookSavePayload): Promise<string> {
  const response = await page.request.post(URLS.STUDENT_SAVE, {
    form: {
      'model[ID]': payload.id,
      'model[LogBookHeaderID]': payload.logBookHeaderID,
      'model[Date]': payload.date,
      'model[Activity]': payload.activity,
      'model[ClockIn]': payload.clockIn,
      'model[ClockOut]': payload.clockOut,
      'model[Description]': payload.description,
      'model[flagjulyactive]': String(payload.flagjulyactive)
    },
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': page.url()
    }
  });

  if (!response.ok()) {
    throw new Error(`StudentSave returned HTTP ${response.status()}`);
  }

  const text = await response.text();
  let status: string;
  try {
    status = String(JSON.parse(text).status ?? '');
  } catch {
    // Non-JSON response usually means the session expired and we got a login page
    throw new Error(`StudentSave returned non-JSON response: ${text.slice(0, 100)}`);
  }

  if (!status.toLowerCase().includes('success')) {
    throw new Error(`StudentSave rejected entry: ${status || text.slice(0, 100)}`);
  }

  return status;
}
