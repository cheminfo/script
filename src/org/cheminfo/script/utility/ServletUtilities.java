package org.cheminfo.script.utility;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

public class ServletUtilities {

	public static String getMimetype(String filename) {
		if (filename == null)
			return "text/text";
		String extension = filename.trim();// filename.replace("[^.]\\.","").toLowerCase();

		if (extension.endsWith("gif")) {
			return "image/gif";
		} else if ((extension.endsWith("jpg")) || (extension.endsWith("jpeg"))) {
			return "image/jpeg";
		} else if (extension.endsWith("pdf")) {
			return "application/pdf";
		} else if (extension.endsWith("png")) {
			return "image/png";
		} else if ((extension.endsWith("jdx")) || (extension.endsWith("dx"))) {
			return "chemical/x-jcamp-dx";
		} else if (extension.endsWith("mol")) {
			return "chemical/x-mdl-molfile";
		} else if (extension.endsWith("zip")) {
			return "application/zip";
		} else if (extension.endsWith("json")||extension.endsWith("array")) {
			return "application/json";
		} else {
			return "text/text";
		}
	}

	public static void returnResponse(HttpServletResponse response,
			String toReturn) {
		returnResponse(response, toReturn, "text/plain");
	}

	public static void returnResponse(HttpServletResponse response,
			String toReturn, String mimeType) {
		returnResponse(response, toReturn, mimeType, "");
	}

	public static void returnResponse(HttpServletResponse response,
			String toReturn, String mimeType, String filename) {
		try {
			response.setContentType(mimeType);
			if ((filename != null) && (filename.length() > 0)) {
				response.setHeader("Content-Disposition",
						"attachment; filename=\"" + filename + "\"");
			}
			if (mimeType.startsWith("text")) {
				PrintStream out = new PrintStream(response.getOutputStream(),
						true, "UTF-8");
				out.println(toReturn);
				out.close();
			} else {
				PrintWriter out = response.getWriter();
				out.println(toReturn);
				out.close();
			}
		} catch (IOException e) {
			throw new RuntimeException("ServletUtilities: " + e.toString());
		}
	}

	public static OutputStream getOutputStream(HttpServletResponse response,
			String mimetype) {
		response.setContentType(mimetype);
		try {
			return response.getOutputStream();
		} catch (IOException e) {
			throw new RuntimeException("ServletUtilities: " + e.toString());
		}
	}

	public static void returnHtml(HttpServletResponse response, String toReturn) {
		try {
			response.setContentType("text/html");
			PrintWriter out = response.getWriter();
			out.println("<html><head><link href=\"/styles.css\" rel=\"stylesheet\" type=\"text/css\" /></head><body><p>");
			out.println(toReturn);
			out.println("</p></body></html>");
			out.close();
		} catch (IOException e) {
			throw new RuntimeException("ServletUtilities: " + e.toString());
		}
	}

	public static void returnResult(HttpServletResponse response, Object value,
			HashMap<String, String> parameters) {
		try {
			JSONObject json = new JSONObject();
			json.put("result", value);
			for (String key : parameters.keySet()) {
				json.put(key, parameters.get(key));
			}
			response.setContentType("application/json");
			PrintWriter out = response.getWriter();
			out.print(json.toString());
			out.close();
		} catch (Exception e) {
			throw new RuntimeException("ServletUtilities: " + e.toString());
		}

	}

	public static void returnResult(HttpServletResponse response, Object value) {
		returnResult(response, value, new HashMap<String, String>());
	}

	public static void returnStatus(HttpServletResponse response,
			String status, Object value) {
		try {
			JSONObject json = new JSONObject();
			json.put("status", status);
			json.put("result", value);
			response.setContentType("application/json");
			PrintWriter out = response.getWriter();
			out.print(json.toString());
			out.close();
		} catch (Exception e) {
			throw new RuntimeException("ServletUtilities: " + e.toString());
		}
	}

	public static void returnError(HttpServletResponse response, String value) {
		JSONObject json = new JSONObject();
		try {
			System.out.println("ServletUtilisties: response");
			json.put("error", value);
			response.setContentType("application/json");
			PrintWriter out = response.getWriter();
			out.print(json.toString());
			out.close();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
