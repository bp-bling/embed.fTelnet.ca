﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace my.fTelnet.ca
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/Content/css/bootstrap.min.css",
                "~/Content/css/site.css"));

            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                "~/Scripts/site.js",
                "~/HtmlTerm/HtmlTerm.js", // TODO
                //TODO "~/HtmlTerm/HtmlTerm.compiled.js",
                "~/HtmlTerm/HtmlTerm.font-437.js",
                "~/HtmlTerm/HtmlTerm.font-c64.js",
                "~/HtmlTerm/VirtualKeyboard.js",
                "~/Scripts/jquery.tablesorter-2.13.3.min.js"));
        }
    }
}