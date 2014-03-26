/*
 * Test harness for diff_match_patch.java
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package name.fraser.neil.plaintext;

import junit.framework.TestCase;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import name.fraser.neil.plaintext.DiffMatchPatch.Diff;
import name.fraser.neil.plaintext.DiffMatchPatch.LinesToCharsResult;
import name.fraser.neil.plaintext.DiffMatchPatch.Patch;

public class Test extends TestCase {

	
	public static void main (String[] args) {
		DiffMatchPatch dmp=new DiffMatchPatch();
		LinkedList<Diff> diffs=dmp.diff_main("ABC DEF GHI", "AB DE GHIJ");
		System.out.println(dmp.diff_prettyHtml(diffs));
	}
}

