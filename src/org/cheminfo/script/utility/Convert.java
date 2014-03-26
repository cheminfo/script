package org.cheminfo.script.utility;



// http://cvs.berlios.de/cgi-bin/viewcvs.cgi/foafscape/all/src/org/foafscape/security/util/Convert.java?rev=1.1&content-type=text/vnd.viewcvs-markup



import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;



/**

 * <p>

 * <code>Convert</code> contains methods used to convert different object

 * types.

 * </p>

 *  

 */



public final class Convert {

    /** Log for this class */

    /** Size of the byte array used to read files */

    private static final int FILE_BYTE_ARRAY_SIZE = 1024;



    /** Default character set for creating strings */

    private static final String DEFAULT_CHARSET = "UTF-8";



    /**

     * <p>

     * Default constructor.

     * </p>

     */

    private Convert() {

    }



    /**

     * <p>

     * This converts a <code>String[]</code> to a <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>String[]</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     */

    public static byte[] stringArrayToByteArray(final String[] input) {

        ByteArrayOutputStream data = new ByteArrayOutputStream();

        if (input != null) {

            for (int i = 0; i < input.length; i++) {

                if (input[i] != null) {

                    try {

                        byte[] bytes = input[i].getBytes(DEFAULT_CHARSET);

                        data.write(bytes, 0, bytes.length);

                    } catch (UnsupportedEncodingException e) {

                            System.out.println("Could not encode or decode using "

                                    + DEFAULT_CHARSET + e.toString());

                    }

                }

            }

        }

        return data.toByteArray();

    }



    /**
     * <p>

     * This reads all the data from an <code>InputStream</code> and returns

     * that data in a <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>InputStream</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     * @throws IOException

     *             if an I/O error occurs while reading from input

     */

    public static byte[] inputStreamToByteArray(final InputStream input)

            throws IOException {

        ByteArrayOutputStream data = new ByteArrayOutputStream();

        if (input != null) {

            try {

                byte[] buffer = new byte[FILE_BYTE_ARRAY_SIZE];

                int length;

                while ((length = input.read(buffer)) != -1) {

                    data.write(buffer, 0, length);

                }

            } finally {

                data.close();

            }

        }

        return data.toByteArray();

    }



    /**

     * <p>

     * This converts the data read from an <code>InputStream</code> to a

     * <code>String</code>.

     * </p>

     * 

     * @param input

     *            <code>InputStream</code> to read from

     * @return <code>String</code>- resulting String

     * @throws IOException

     *             if an I/O error occurs while reading from input

     */

    public static String inputStreamToString(final InputStream input)

            throws IOException {

        String results = null;

        

        if (input != null) {

            results = new String(inputStreamToByteArray(input), DEFAULT_CHARSET);

        }



        return results;

    }



    /**

     * <p>

     * This converts a <code>File</code> to a <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>File</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     * @throws IOException

     *             if an I/O error occurs while reading from input

     */

    public static byte[] fileToByteArray(final File input) throws IOException {

        byte[] results = null;

        if (input != null) {

            FileInputStream in = new FileInputStream(input);

            results = inputStreamToByteArray(in);

        }

        return results;

    }



    /**

     * <p>

     * This converts a <code>File</code> to a <code>InputStream</code>.

     * </p>

     * 

     * @param input

     *            <code>File</code> to convert

     * @return <code>InputStream</code>- resulting input stream

     * @throws IOException

     *             if an I/O error occurs while reading from input

     */

    public static InputStream fileToInputStream(final File input)

            throws IOException {

        DataInputStream is = new DataInputStream(new FileInputStream(input));

        byte[] bytes = new byte[is.available()];

        is.readFully(bytes);

        ByteArrayInputStream data = new ByteArrayInputStream(bytes);

        return data;

    }



    /**

     * <p>

     * This converts the contents of a <code>File</code> to a String.

     * </p>

     * 

     * @param input

     *            <code>File</code> to convert

     * @return <code>String</code>

     * @throws IOException

     *             if an I/O error occurs while reading from input

     */

    public static String fileToString(final File input) throws IOException {

        String results = null;

        if (input != null) {

            results = byteArrayToString(fileToByteArray(input));

        }

        return results;

    }



    /**

     * <p>

     * This converts a <code>String</code> to a <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>String</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     */

    public static byte[] stringToByteArray(final String input) {

        byte[] results = null;

        if (input != null) {

            try {

                results = input.getBytes(DEFAULT_CHARSET);

            } catch (UnsupportedEncodingException e) {

                    System.out.println("Could not encode or decode using "

                            + DEFAULT_CHARSET + e.toString());

            }

        }

        return results;

    }



    /**

     * <p>

     * This converts a <code>byte[]</code> to a <code>String</code>.

     * </p>

     * 

     * @param input

     *            <code>byte[]</code> to convert

     * @return <code>String</code>- resulting String

     */

    public static String byteArrayToString(final byte[] input) {

        String results = null;

        if (input != null) {

            try {

                results = new String(input, DEFAULT_CHARSET);

            } catch (UnsupportedEncodingException e) {

                    System.out.println("Could not encode or decode using "

                            + DEFAULT_CHARSET + e.toString());

            }

        }

        return results;

    }



    /**

     * <p>

     * This converts a <code>char[]</code> to a <code>String</code> in

     * hexidecimal format.

     * </p>

     * 

     * @param input

     *            <code>byte[]</code> to convert

     * @return <code>String</code>- resulting Hex String

     * 

     * public static String charArrayToHex(final char[] input) { return

     * byteArrayToHex(charArrayToByteArray(input)); }

     * 

     * /**

     * <p>

     * This converts a <code>byte[]</code> to a <code>String</code> in

     * hexidecimal format.

     * </p>

     * 

     * @param input

     *            <code>byte[]</code> to convert

     * @return <code>String</code>- resulting Hex String

     * 

     * public static String byteArrayToHex(final byte[] input) { String results =

     * null; if (input != null) { Hex hex = new Hex(); try { results = new

     * String(hex.encode(input), DEFAULT_CHARSET); } catch

     * (UnsupportedEncodingException e) { if (LOG.isErrorEnabled()) {

     * System.out.println("Could not encode or decode using " + DEFAULT_CHARSET, e); } } }

     * return results; }

     */



    /**

     * <p>

     * This converts a <code>String</code> in hexidecimal format to a

     * <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>String</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     * 

     * public static byte[] hexToByteArray(final String input) { byte[] results =

     * null; if (input != null) { Hex hex = new Hex(); try { results =

     * hex.decode(input.getBytes(DEFAULT_CHARSET)); } catch

     * (UnsupportedEncodingException e) { if (LOG.isErrorEnabled()) {

     * System.out.println("Could not encode or decode using " + DEFAULT_CHARSET, e); } } }

     * return results; }

     */





    /**

     * <p>

     * This converts a <code>char[]</code> to a <code>byte[]</code>.

     * </p>

     * 

     * @param input

     *            <code>char[]</code> to convert

     * @return <code>byte[]</code>- resulting byte array

     */

    public static byte[] charArrayToByteArray(final char[] input) {

        ByteArrayOutputStream data = new ByteArrayOutputStream();

        if (input != null) {

            for (int i = 0; i < input.length; i++) {

                data.write(input[i]);

            }

        }

        return data.toByteArray();

    }



    /**

     * <p>

     * This will write the supplied <code>byte[]</code> to the supplied

     * <code>File</code>.

     * </p>

     * 

     * @param input

     *            <code>byte[]</code>

     * @param file

     *            <code>File</code>

     * @throws IOException

     *             if an I/O error occurs

     */

    public static void byteArrayToFile(final byte[] input, final File file)

            throws IOException {

        byteArrayToStream(input, new FileOutputStream(file));

    }



    /**

     * <p>

     * This will write the supplied <code>byte[]</code> to the supplied

     * <code>OutputStream</code>.

     * </p>

     * 

     * @param input

     *            <code>byte[]</code>

     * @param out

     *            <code>OutputStream</code>

     * @throws IOException

     *             if an I/O error occurs

     */

    public static void byteArrayToStream(final byte[] input,

            final OutputStream out) throws IOException {

        if (input != null && out != null) {

            try {

                out.write(input);

            } finally {

                if (out != null) {

                    out.close();

                }

            }

        }

    }



    /**

     * <p>

     * This will read the supplied <code>File</code> and return the object it

     * contains.. Only objects that support the java.io.Serializable interface

     * can be read.

     * </p>

     * 

     * @param file

     *            <code>File</code>

     * @return <code>Object</code>

     * @throws IOException

     *             if an I/O error occurs

     * @throws ClassNotFoundException

     *             if the class of a serialized object cannot be found

     */

    public static Object fileToObject(final File file) throws IOException,

            ClassNotFoundException {

        return inputStreamToObject(new FileInputStream(file));

    }



    /**

     * <p>

     * This will read the supplied <code>InputStream</code> and return the

     * object it contains. Only objects that support the java.io.Serializable

     * interface can be read.

     * </p>

     * 

     * @param input

     *            <code>InputStream</code>

     * @return <code>Object</code>

     * @throws IOException

     *             if an I/O error occurs

     * @throws ClassNotFoundException

     *             if the class of a serialized object cannot be found

     */

    public static Object inputStreamToObject(final InputStream input)

            throws IOException, ClassNotFoundException {

        Object o = null;

        if (input != null) {

            ObjectInputStream in = null;

            try {

                in = new ObjectInputStream(input);

                o = in.readObject();

                if (in.markSupported()) {

                    in.reset();

                }

            } finally {

                if (in != null) {

                    in.close();

                }

            }

        }

        return o;

    }



    /**

     * <p>

     * This will write the supplied <code>Object</code> to the supplied

     * <code>File</code>. Only objects that support the java.io.Serializable

     * interface can be written.

     * </p>

     * 

     * @param input

     *            <code>Object</code>

     * @param file

     *            <code>File</code>

     * @throws IOException

     *             if an I/O error occurs

     */

    public static void objectToFile(final Object input, final File file)

            throws IOException {

        objectToOutputStream(input, new FileOutputStream(file));

    }



    /**

     * <p>

     * This will write the supplied <code>Object</code> to the supplied

     * <code>OutputStream</code>. Only objects that support the

     * java.io.Serializable interface can be written.

     * </p>

     * 

     * @param input

     *            <code>Object</code>

     * @param output

     *            <code>OutputStream</code>

     * @throws IOException

     *             if an I/O error occurs

     */

    public static void objectToOutputStream(final Object input,

            final OutputStream output) throws IOException {

        if (input != null && output != null) {

            ObjectOutputStream out = null;

            try {

                out = new ObjectOutputStream(output);

                out.writeObject(input);

                out.reset();

            } finally {

                if (out != null) {

                    out.close();

                }

            }

        }

    }

}

