// Code generated by github.com/whyrusleeping/cbor-gen. DO NOT EDIT.

package whtwnd_autogen

import (
	"fmt"
	"io"
	"math"
	"sort"

	util "github.com/bluesky-social/indigo/lex/util"
	cid "github.com/ipfs/go-cid"
	cbg "github.com/whyrusleeping/cbor-gen"
	xerrors "golang.org/x/xerrors"
)

var _ = xerrors.Errorf
var _ = cid.Undef
var _ = math.E
var _ = sort.Sort

func (t *BlogEntry) MarshalCBOR(w io.Writer) error {
	if t == nil {
		_, err := w.Write(cbg.CborNull)
		return err
	}

	cw := cbg.NewCborWriter(w)
	fieldCount := 7

	if t.CreatedAt == nil {
		fieldCount--
	}

	if t.Ogp == nil {
		fieldCount--
	}

	if t.Theme == nil {
		fieldCount--
	}

	if t.Title == nil {
		fieldCount--
	}

	if t.Tracker == nil {
		fieldCount--
	}

	if _, err := cw.Write(cbg.CborEncodeMajorType(cbg.MajMap, uint64(fieldCount))); err != nil {
		return err
	}

	// t.Ogp (whtwnd_autogen.BlogDefs_Ogp) (struct)
	if t.Ogp != nil {

		if len("ogp") > 1000000 {
			return xerrors.Errorf("Value in field \"ogp\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("ogp"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("ogp")); err != nil {
			return err
		}

		if err := t.Ogp.MarshalCBOR(cw); err != nil {
			return err
		}
	}

	// t.LexiconTypeID (string) (string)
	if len("$type") > 1000000 {
		return xerrors.Errorf("Value in field \"$type\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("$type"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("$type")); err != nil {
		return err
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("com.whtwnd.blog.entry"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("com.whtwnd.blog.entry")); err != nil {
		return err
	}

	// t.Theme (string) (string)
	if t.Theme != nil {

		if len("theme") > 1000000 {
			return xerrors.Errorf("Value in field \"theme\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("theme"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("theme")); err != nil {
			return err
		}

		if t.Theme == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if len(*t.Theme) > 1000000 {
				return xerrors.Errorf("Value in field t.Theme was too long")
			}

			if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(*t.Theme))); err != nil {
				return err
			}
			if _, err := cw.WriteString(string(*t.Theme)); err != nil {
				return err
			}
		}
	}

	// t.Title (string) (string)
	if t.Title != nil {

		if len("title") > 1000000 {
			return xerrors.Errorf("Value in field \"title\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("title"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("title")); err != nil {
			return err
		}

		if t.Title == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if len(*t.Title) > 1000000 {
				return xerrors.Errorf("Value in field t.Title was too long")
			}

			if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(*t.Title))); err != nil {
				return err
			}
			if _, err := cw.WriteString(string(*t.Title)); err != nil {
				return err
			}
		}
	}

	// t.Content (string) (string)
	if len("content") > 1000000 {
		return xerrors.Errorf("Value in field \"content\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("content"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("content")); err != nil {
		return err
	}

	if len(t.Content) > 1000000 {
		return xerrors.Errorf("Value in field t.Content was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(t.Content))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string(t.Content)); err != nil {
		return err
	}

	// t.Tracker (string) (string)
	if t.Tracker != nil {

		if len("tracker") > 1000000 {
			return xerrors.Errorf("Value in field \"tracker\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("tracker"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("tracker")); err != nil {
			return err
		}

		if t.Tracker == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if len(*t.Tracker) > 1000000 {
				return xerrors.Errorf("Value in field t.Tracker was too long")
			}

			if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(*t.Tracker))); err != nil {
				return err
			}
			if _, err := cw.WriteString(string(*t.Tracker)); err != nil {
				return err
			}
		}
	}

	// t.CreatedAt (string) (string)
	if t.CreatedAt != nil {

		if len("createdAt") > 1000000 {
			return xerrors.Errorf("Value in field \"createdAt\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("createdAt"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("createdAt")); err != nil {
			return err
		}

		if t.CreatedAt == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if len(*t.CreatedAt) > 1000000 {
				return xerrors.Errorf("Value in field t.CreatedAt was too long")
			}

			if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(*t.CreatedAt))); err != nil {
				return err
			}
			if _, err := cw.WriteString(string(*t.CreatedAt)); err != nil {
				return err
			}
		}
	}
	return nil
}

func (t *BlogEntry) UnmarshalCBOR(r io.Reader) (err error) {
	*t = BlogEntry{}

	cr := cbg.NewCborReader(r)

	maj, extra, err := cr.ReadHeader()
	if err != nil {
		return err
	}
	defer func() {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
	}()

	if maj != cbg.MajMap {
		return fmt.Errorf("cbor input should be of type map")
	}

	if extra > cbg.MaxLength {
		return fmt.Errorf("BlogEntry: map struct too large (%d)", extra)
	}

	var name string
	n := extra

	for i := uint64(0); i < n; i++ {

		{
			sval, err := cbg.ReadStringWithMax(cr, 1000000)
			if err != nil {
				return err
			}

			name = string(sval)
		}

		switch name {
		// t.Ogp (whtwnd_autogen.BlogDefs_Ogp) (struct)
		case "ogp":

			{

				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}
					t.Ogp = new(BlogDefs_Ogp)
					if err := t.Ogp.UnmarshalCBOR(cr); err != nil {
						return xerrors.Errorf("unmarshaling t.Ogp pointer: %w", err)
					}
				}

			}
			// t.LexiconTypeID (string) (string)
		case "$type":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.LexiconTypeID = string(sval)
			}
			// t.Theme (string) (string)
		case "theme":

			{
				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}

					sval, err := cbg.ReadStringWithMax(cr, 1000000)
					if err != nil {
						return err
					}

					t.Theme = (*string)(&sval)
				}
			}
			// t.Title (string) (string)
		case "title":

			{
				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}

					sval, err := cbg.ReadStringWithMax(cr, 1000000)
					if err != nil {
						return err
					}

					t.Title = (*string)(&sval)
				}
			}
			// t.Content (string) (string)
		case "content":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.Content = string(sval)
			}
			// t.Tracker (string) (string)
		case "tracker":

			{
				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}

					sval, err := cbg.ReadStringWithMax(cr, 1000000)
					if err != nil {
						return err
					}

					t.Tracker = (*string)(&sval)
				}
			}
			// t.CreatedAt (string) (string)
		case "createdAt":

			{
				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}

					sval, err := cbg.ReadStringWithMax(cr, 1000000)
					if err != nil {
						return err
					}

					t.CreatedAt = (*string)(&sval)
				}
			}

		default:
			// Field doesn't exist on this type, so ignore it
			cbg.ScanForLinks(r, func(cid.Cid) {})
		}
	}

	return nil
}
func (t *BlogDefs_BlobMetadata) MarshalCBOR(w io.Writer) error {
	if t == nil {
		_, err := w.Write(cbg.CborNull)
		return err
	}

	cw := cbg.NewCborWriter(w)
	fieldCount := 2

	if t.Name == nil {
		fieldCount--
	}

	if _, err := cw.Write(cbg.CborEncodeMajorType(cbg.MajMap, uint64(fieldCount))); err != nil {
		return err
	}

	// t.Name (string) (string)
	if t.Name != nil {

		if len("name") > 1000000 {
			return xerrors.Errorf("Value in field \"name\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("name"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("name")); err != nil {
			return err
		}

		if t.Name == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if len(*t.Name) > 1000000 {
				return xerrors.Errorf("Value in field t.Name was too long")
			}

			if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(*t.Name))); err != nil {
				return err
			}
			if _, err := cw.WriteString(string(*t.Name)); err != nil {
				return err
			}
		}
	}

	// t.Blobref (util.LexBlob) (struct)
	if len("blobref") > 1000000 {
		return xerrors.Errorf("Value in field \"blobref\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("blobref"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("blobref")); err != nil {
		return err
	}

	if err := t.Blobref.MarshalCBOR(cw); err != nil {
		return err
	}
	return nil
}

func (t *BlogDefs_BlobMetadata) UnmarshalCBOR(r io.Reader) (err error) {
	*t = BlogDefs_BlobMetadata{}

	cr := cbg.NewCborReader(r)

	maj, extra, err := cr.ReadHeader()
	if err != nil {
		return err
	}
	defer func() {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
	}()

	if maj != cbg.MajMap {
		return fmt.Errorf("cbor input should be of type map")
	}

	if extra > cbg.MaxLength {
		return fmt.Errorf("BlogDefs_BlobMetadata: map struct too large (%d)", extra)
	}

	var name string
	n := extra

	for i := uint64(0); i < n; i++ {

		{
			sval, err := cbg.ReadStringWithMax(cr, 1000000)
			if err != nil {
				return err
			}

			name = string(sval)
		}

		switch name {
		// t.Name (string) (string)
		case "name":

			{
				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}

					sval, err := cbg.ReadStringWithMax(cr, 1000000)
					if err != nil {
						return err
					}

					t.Name = (*string)(&sval)
				}
			}
			// t.Blobref (util.LexBlob) (struct)
		case "blobref":

			{

				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}
					t.Blobref = new(util.LexBlob)
					if err := t.Blobref.UnmarshalCBOR(cr); err != nil {
						return xerrors.Errorf("unmarshaling t.Blobref pointer: %w", err)
					}
				}

			}

		default:
			// Field doesn't exist on this type, so ignore it
			cbg.ScanForLinks(r, func(cid.Cid) {})
		}
	}

	return nil
}
func (t *BlogComment) MarshalCBOR(w io.Writer) error {
	if t == nil {
		_, err := w.Write(cbg.CborNull)
		return err
	}

	cw := cbg.NewCborWriter(w)

	if _, err := cw.Write([]byte{163}); err != nil {
		return err
	}

	// t.LexiconTypeID (string) (string)
	if len("$type") > 1000000 {
		return xerrors.Errorf("Value in field \"$type\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("$type"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("$type")); err != nil {
		return err
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("com.whtwnd.blog.comment"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("com.whtwnd.blog.comment")); err != nil {
		return err
	}

	// t.Content (string) (string)
	if len("content") > 1000000 {
		return xerrors.Errorf("Value in field \"content\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("content"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("content")); err != nil {
		return err
	}

	if len(t.Content) > 1000000 {
		return xerrors.Errorf("Value in field t.Content was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(t.Content))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string(t.Content)); err != nil {
		return err
	}

	// t.EntryUri (string) (string)
	if len("entryUri") > 1000000 {
		return xerrors.Errorf("Value in field \"entryUri\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("entryUri"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("entryUri")); err != nil {
		return err
	}

	if len(t.EntryUri) > 1000000 {
		return xerrors.Errorf("Value in field t.EntryUri was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(t.EntryUri))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string(t.EntryUri)); err != nil {
		return err
	}
	return nil
}

func (t *BlogComment) UnmarshalCBOR(r io.Reader) (err error) {
	*t = BlogComment{}

	cr := cbg.NewCborReader(r)

	maj, extra, err := cr.ReadHeader()
	if err != nil {
		return err
	}
	defer func() {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
	}()

	if maj != cbg.MajMap {
		return fmt.Errorf("cbor input should be of type map")
	}

	if extra > cbg.MaxLength {
		return fmt.Errorf("BlogComment: map struct too large (%d)", extra)
	}

	var name string
	n := extra

	for i := uint64(0); i < n; i++ {

		{
			sval, err := cbg.ReadStringWithMax(cr, 1000000)
			if err != nil {
				return err
			}

			name = string(sval)
		}

		switch name {
		// t.LexiconTypeID (string) (string)
		case "$type":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.LexiconTypeID = string(sval)
			}
			// t.Content (string) (string)
		case "content":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.Content = string(sval)
			}
			// t.EntryUri (string) (string)
		case "entryUri":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.EntryUri = string(sval)
			}

		default:
			// Field doesn't exist on this type, so ignore it
			cbg.ScanForLinks(r, func(cid.Cid) {})
		}
	}

	return nil
}
func (t *BlogDefs_Ogp) MarshalCBOR(w io.Writer) error {
	if t == nil {
		_, err := w.Write(cbg.CborNull)
		return err
	}

	cw := cbg.NewCborWriter(w)
	fieldCount := 3

	if t.Height == nil {
		fieldCount--
	}

	if t.Width == nil {
		fieldCount--
	}

	if _, err := cw.Write(cbg.CborEncodeMajorType(cbg.MajMap, uint64(fieldCount))); err != nil {
		return err
	}

	// t.Url (string) (string)
	if len("url") > 1000000 {
		return xerrors.Errorf("Value in field \"url\" was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("url"))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string("url")); err != nil {
		return err
	}

	if len(t.Url) > 1000000 {
		return xerrors.Errorf("Value in field t.Url was too long")
	}

	if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len(t.Url))); err != nil {
		return err
	}
	if _, err := cw.WriteString(string(t.Url)); err != nil {
		return err
	}

	// t.Width (int64) (int64)
	if t.Width != nil {

		if len("width") > 1000000 {
			return xerrors.Errorf("Value in field \"width\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("width"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("width")); err != nil {
			return err
		}

		if t.Width == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if *t.Width >= 0 {
				if err := cw.WriteMajorTypeHeader(cbg.MajUnsignedInt, uint64(*t.Width)); err != nil {
					return err
				}
			} else {
				if err := cw.WriteMajorTypeHeader(cbg.MajNegativeInt, uint64(-*t.Width-1)); err != nil {
					return err
				}
			}
		}

	}

	// t.Height (int64) (int64)
	if t.Height != nil {

		if len("height") > 1000000 {
			return xerrors.Errorf("Value in field \"height\" was too long")
		}

		if err := cw.WriteMajorTypeHeader(cbg.MajTextString, uint64(len("height"))); err != nil {
			return err
		}
		if _, err := cw.WriteString(string("height")); err != nil {
			return err
		}

		if t.Height == nil {
			if _, err := cw.Write(cbg.CborNull); err != nil {
				return err
			}
		} else {
			if *t.Height >= 0 {
				if err := cw.WriteMajorTypeHeader(cbg.MajUnsignedInt, uint64(*t.Height)); err != nil {
					return err
				}
			} else {
				if err := cw.WriteMajorTypeHeader(cbg.MajNegativeInt, uint64(-*t.Height-1)); err != nil {
					return err
				}
			}
		}

	}
	return nil
}

func (t *BlogDefs_Ogp) UnmarshalCBOR(r io.Reader) (err error) {
	*t = BlogDefs_Ogp{}

	cr := cbg.NewCborReader(r)

	maj, extra, err := cr.ReadHeader()
	if err != nil {
		return err
	}
	defer func() {
		if err == io.EOF {
			err = io.ErrUnexpectedEOF
		}
	}()

	if maj != cbg.MajMap {
		return fmt.Errorf("cbor input should be of type map")
	}

	if extra > cbg.MaxLength {
		return fmt.Errorf("BlogDefs_Ogp: map struct too large (%d)", extra)
	}

	var name string
	n := extra

	for i := uint64(0); i < n; i++ {

		{
			sval, err := cbg.ReadStringWithMax(cr, 1000000)
			if err != nil {
				return err
			}

			name = string(sval)
		}

		switch name {
		// t.Url (string) (string)
		case "url":

			{
				sval, err := cbg.ReadStringWithMax(cr, 1000000)
				if err != nil {
					return err
				}

				t.Url = string(sval)
			}
			// t.Width (int64) (int64)
		case "width":
			{

				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}
					maj, extra, err := cr.ReadHeader()
					if err != nil {
						return err
					}
					var extraI int64
					switch maj {
					case cbg.MajUnsignedInt:
						extraI = int64(extra)
						if extraI < 0 {
							return fmt.Errorf("int64 positive overflow")
						}
					case cbg.MajNegativeInt:
						extraI = int64(extra)
						if extraI < 0 {
							return fmt.Errorf("int64 negative overflow")
						}
						extraI = -1 - extraI
					default:
						return fmt.Errorf("wrong type for int64 field: %d", maj)
					}

					t.Width = (*int64)(&extraI)
				}
			}
			// t.Height (int64) (int64)
		case "height":
			{

				b, err := cr.ReadByte()
				if err != nil {
					return err
				}
				if b != cbg.CborNull[0] {
					if err := cr.UnreadByte(); err != nil {
						return err
					}
					maj, extra, err := cr.ReadHeader()
					if err != nil {
						return err
					}
					var extraI int64
					switch maj {
					case cbg.MajUnsignedInt:
						extraI = int64(extra)
						if extraI < 0 {
							return fmt.Errorf("int64 positive overflow")
						}
					case cbg.MajNegativeInt:
						extraI = int64(extra)
						if extraI < 0 {
							return fmt.Errorf("int64 negative overflow")
						}
						extraI = -1 - extraI
					default:
						return fmt.Errorf("wrong type for int64 field: %d", maj)
					}

					t.Height = (*int64)(&extraI)
				}
			}

		default:
			// Field doesn't exist on this type, so ignore it
			cbg.ScanForLinks(r, func(cid.Cid) {})
		}
	}

	return nil
}
